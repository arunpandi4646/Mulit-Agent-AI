import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  useEffect(() => {
    axios.get('/api/tasks')
      .then(response => {
        setTasks(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const handleCreateTask = async (task) => {
    try {
      const response = await axios.post('/api/tasks', task);
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateTask = async (task) => {
    try {
      const response = await axios.put(`/api/tasks/${task._id}`, task);
      setTasks(tasks.map((t) => t._id === task._id ? response.data : t));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <TaskForm onCreateTask={handleCreateTask} />
      <TaskList tasks={tasks} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
    </div>
  );
}

export default App;