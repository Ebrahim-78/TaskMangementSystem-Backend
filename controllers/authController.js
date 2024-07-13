const authService = require('../services/authService');

const signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authService.signup(email, password);
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002' && error.meta && error.meta.target.includes('email')) {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'An error occurred while creating the user' });
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { token } = await authService.login(email, password);
    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

module.exports = { signup, login };
