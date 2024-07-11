from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import BaggingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
import joblib

def find_best_model(df):
    X = df.drop(columns=['class'])
    y = df['class']

    # Model with each params
    param_grid = {'n_estimators': 100, 'estimator__max_depth': 7}
    base_tree = DecisionTreeClassifier(max_depth=param_grid['estimator__max_depth'])
    model = BaggingClassifier(estimator=base_tree, n_estimators=param_grid['n_estimators'])

    # Number of runs
    num_runs = 5
    best_model = None
    best_score = 0

    for run in range(num_runs):
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=run)

        # Train the model
        model.fit(X_train, y_train)

        # Cross-validation scores
        scores = cross_val_score(model, X, y, cv=5)
        average_cv_score = scores.mean()
        print(f"Average cross-validation score for Bagged Trees (Run {run + 1}): {average_cv_score}\n")
        
        # Save the best model if it has the highest average CV score
        if average_cv_score > best_score:
            best_model = model
            best_score = average_cv_score
        
    # Save the best model and feature names to disk
    joblib.dump((best_model, X.columns.tolist()), 'best_model.pkl')
    return best_model, param_grid, best_score
