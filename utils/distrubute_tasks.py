import joblib
import pandas as pd
import os
import time

def load_model():
    while not os.path.exists('best_model.pkl'):
        time.sleep(5)
    return joblib.load('best_model.pkl')

def categorize_burned_points(x):
    return 1 if x <= 0.5 else 2 if x <= 2 else 3

# Predict execution time for a task given an assignee
def predict_execution_time(task, assignee, model, feature_names):
    # Encode the assignee in the task
    task_with_assignee = task.copy()
    for key in feature_names:
        if key == assignee:
            task_with_assignee[key] = 1
        elif key not in task_with_assignee:
            task_with_assignee[key] = 0
    task_features = pd.DataFrame([task_with_assignee], columns=feature_names)
    return model.predict(task_features)[0]

# Greedy Algorithm for Task Distribution considering assignee's performance
def distribute_tasks(tasks, assignees):
    def adjust_predicted_time(predicted_time):
        if predicted_time == 1:
            return 0.25
        elif predicted_time == 2:
            return 1.25
        elif predicted_time == 3:
            return 2.5
        return predicted_time  # If it's not 1, 2, or 3, return the original value

    model, feature_names = load_model()

    # Initialize a dictionary to keep track of the total execution time for each assignee
    assignee_times = {assignee: 0 for assignee in assignees}
    
    # Initialize task assignment dictionary
    task_assignment = {assignee: [] for assignee in assignees}
    
    task_counter = 1  # Initialize a counter for tasks
    
    # For each task, find the best assignee
    for task in tasks:
        best_assignee = None
        best_score = float('inf')
        
        # Evaluate each assignee for the current task
        for assignee in assignees:
            predicted_time = predict_execution_time(task, assignee, model, feature_names)
            adjusted_time = adjust_predicted_time(predicted_time)
            total_time_with_new_task = assignee_times[assignee] + adjusted_time
            
            if total_time_with_new_task < best_score:
                best_score = total_time_with_new_task
                best_assignee = assignee
        
        # Update the total execution time for the best assignee
        assignee_times[best_assignee] += adjusted_time

        task['class'] = categorize_burned_points(task['burnedPoints'])

        # Assign the task to the best assignee found
        task_assignment[best_assignee].append({
            'title': f'task{task_counter}',  # Assign title in the form "task1", "task2", ...
            # 'title': task['title'],
            'best_class_estimated': predicted_time
        })
        
        task_counter += 1  # Increment the task counter

    return task_assignment
