const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createTask = (title, description, userId) => {
  return prisma.task.create({
    data: { title, description, userId },
  });
};

const getAllTasks = (userId) => prisma.task.findMany({ where: { userId } });

const getTaskById = (id) => prisma.task.findUnique({ where: { id: parseInt(id) } });

const updateTask = (id, title, description, completed) => {
  return prisma.task.update({
    where: { id: parseInt(id) },
    data: { title, description, completed },
  });
};

const deleteTask = (id) => prisma.task.delete({ where: { id: parseInt(id) } });

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask };
