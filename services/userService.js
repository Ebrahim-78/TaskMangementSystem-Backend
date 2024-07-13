const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const getAllUsers = () => prisma.user.findMany();

const getUserById = (id) => prisma.user.findUnique({ where: { id: parseInt(id) } });

const updateUser = async (id, email, password) => {
  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
  return prisma.user.update({
    where: { id: parseInt(id) },
    data: { email, password: hashedPassword },
  });
};

const deleteUser = (id) => prisma.user.delete({ where: { id: parseInt(id) } });

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
