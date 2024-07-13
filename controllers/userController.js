const userService = require('../services/userService');

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userService.getUserById(id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the user' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, password } = req.body;
  try {
    const user = await userService.updateUser(id, email, password);
    res.status(200).json(user);
  } catch (error) {
    if (error.code === 'P2002' && error.meta && error.meta.target.includes('email')) {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'An error occurred while updating the user' });
    }
  }
};

// const deleteUser = async (req, res) => {
//   const { id } = req.params;
//   try {
//     await userService.deleteUser(id);
//     res.status(204).send();
//   } catch (error) {
//     res.status(500).json({ error: 'An error occurred while deleting the user' });
//   }
// };
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error); // Log the error
    res.status(500).json({ error: 'An error occurred while deleting the user' });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
