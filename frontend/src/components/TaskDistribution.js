import React from 'react';
import './TaskDistribution.css'; // Make sure to import your CSS file

export const TaskDistribution = ({ tasks }) => {
  const getClassBadge = (taskClass) => {
    switch (taskClass) {
      case 1:
        return <span className="badge class-1">Class 1</span>;
      case 2:
        return <span className="badge class-2">Class 2</span>;
      case 3:
        return <span className="badge class-3">Class 3</span>;
      default:
        return null;
    }
  };

  const calculateWorkloadRange = (tasks) => {
    let minWorkload = 0;
    let maxWorkload = 0;
    let averageWorkload = 0;

    tasks.forEach(task => {
      switch (task.best_class_estimated) {
        case 1:
          minWorkload += 0;
          maxWorkload += 0.5;
          averageWorkload += 0.25;
          break;
        case 2:
          minWorkload += 0.5;
          maxWorkload += 2;
          averageWorkload += 1.25;
          break;
        case 3:
          minWorkload += 2;
          maxWorkload += 3;
          averageWorkload += 2.5;
          break;
        default:
          break;
      }
    });

    return { minWorkload, maxWorkload, averageWorkload };
  };

  return (
    <div>
      <div className="explanation">
        <h3>Task Classifications</h3>
        <p><span className="badge class-1">Class 1</span> - Estimated workload: 0-0.5 days</p>
        <p><span className="badge class-2">Class 2</span> - Estimated workload: 0.5-2 days</p>
        <p><span className="badge class-3">Class 3</span> - Estimated workload: 2+ days (Median 3 days)</p>
      </div>
      <div className="graphs-container">
        {Object.keys(tasks).map((userId, userIndex) => {
          const userTasks = tasks[userId].sort((a, b) => a.best_class_estimated - b.best_class_estimated);
          const { minWorkload, maxWorkload, averageWorkload } = calculateWorkloadRange(userTasks);
          return (
            <div key={userId} className="user-section">
              <div className="user-title">
                <div className="user-info">Assignee: {userIndex + 1}</div>
                {/* <div className="user-info">Assignee: {userId}</div> */}
                <div className="workload-info">
                  Estimated Workload: <span className="workload-average">{averageWorkload.toFixed(1)} days </span> 
                  (min: <span className="workload-min">{minWorkload.toFixed(1)} days</span> - 
                  max: <span className="workload-max">{maxWorkload.toFixed(1)} days</span>)
                </div>
              </div>
              {userTasks.map((task, index) => (
                <div key={index} className="task">
                  <div className="task-title">
                    {task.title}
                    {getClassBadge(task.best_class_estimated)}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
