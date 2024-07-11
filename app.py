from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import pandas as pd
import warnings
from sklearn.preprocessing import OneHotEncoder
from utils.bert import get_bert_embeddings
from utils.model_utils import process_assignees, balance_dataset, filter_data, normalize_data, remove_redundant_features
from utils.model import find_best_model
from utils.distrubute_tasks import distribute_tasks
import os
import numpy as np

warnings.filterwarnings("ignore", category=FutureWarning, module="sklearn")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://tasknexus.netlify.app"}})  # Allow CORS from your specific domain

def convert_to_python_types(data):
    if isinstance(data, dict):
        return {key: convert_to_python_types(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_to_python_types(element) for element in data]
    elif isinstance(data, (np.integer, np.floating)):
        return data.item()
    elif isinstance(data, (np.ndarray, pd.Series)):
        return data.tolist()
    else:
        return data

def categorize_burned_points(x): 
    return 1 if x <= 0.5 else 2 if x <= 2 else 3

def pre_process_data(df, fileType):
    df['class'] = df['burnedPoints'].apply(categorize_burned_points)
    for col in ['categories', 'focus_areas', 'labels']:
        df[col] = df[col].apply(lambda x: ','.join(sorted(x)) if isinstance(x, list) else x)
    
    encoder = OneHotEncoder(sparse_output=False)
    encoded_df = pd.DataFrame(
        encoder.fit_transform(df[['categories', 'focus_areas', 'labels']]),
        columns=encoder.get_feature_names_out()
    )

    df = pd.concat([df.reset_index(drop=True), encoded_df], axis=1).drop(columns=['categories', 'focus_areas', 'labels'])
    df = filter_data(df, fileType)
    return balance_dataset(df)

def process_data(data, fileType):
    df = pd.DataFrame(data)
    df = pre_process_data(df, fileType)
    df = normalize_data(df)
    df = process_assignees(df)

    columns = ["title", "body", "commitMessages"]
    if fileType != 'csv':
        columns.append("comments")

    df = get_bert_embeddings(df, columns=columns, n_components=10, method='norm')
    df = remove_redundant_features(df)
    find_best_model(df)
    return df

@app.route('/process', methods=['POST'])
@cross_origin(origin='https://tasknexus.netlify.app')
def process():
    try:
        data = request.json
        fileType = data.get('fileType')
        processed_data = process_data(data['data'], fileType)
        result = processed_data.to_dict(orient='records')
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/delete_model', methods=['POST'])
@cross_origin(origin='https://tasknexus.netlify.app')
def delete_model():
    try:
        if os.path.exists('best_model.pkl'):
            os.remove('best_model.pkl')
        return jsonify({'message': 'Model file deleted successfully.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/distribute', methods=['POST'])
@cross_origin(origin='https://tasknexus.netlify.app')
def distribute():
    try:
        data = request.json
        assignees = data.get('selectedAssignees')
        tasks = data['data']
        result = distribute_tasks(tasks, assignees)
        result = convert_to_python_types(result)

        return jsonify(result), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/')
def hello_world():
    return 'Hello, World!'

if __name__ == "__main__":
    app.run(debug=True)
