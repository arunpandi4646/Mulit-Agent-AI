import React from 'react';

const TaskList = ({ tasks, onUpdateTask, onDeleteTask }) => {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task._id}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onUpdateTask({ ...task, completed: !task.completed })}
          />
          <span>{task.title}</span>
          <button onClick={() => onDeleteTask(task._id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;