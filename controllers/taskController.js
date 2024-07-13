const taskService = require('../services/taskService');

const createTask = async (req, res) => {
  const { title, description } = req.body;
  const { userId } = req.user;
  try {
    const task = await taskService.createTask(title, description, userId);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'An error occurred while creating the task' });
  }
};

const getAllTasks = async (req, res) => {
  const { userId } = req.user;
  try {
    const tasks = await taskService.getAllTasks(userId);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching tasks' });
  }
};

const getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await taskService.getTaskById(id);
    if (task && task.userId === req.user.userId) {
      res.status(200).json(task);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the task' });
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  try {
    const task = await taskService.updateTask(id, title, description, completed);
    if (task.userId === req.user.userId) {
      res.status(200).json(task);
    } else {
      res.status(403).json({ error: 'You are not authorized to update this task' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the task' });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await taskService.getTaskById(id);
    if (task && task.userId === req.user.userId) {
      await taskService.deleteTask(id);
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the task' });
  }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask };
