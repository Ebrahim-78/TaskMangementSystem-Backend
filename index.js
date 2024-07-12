// const express = require('express');
// const { PrismaClient } = require('@prisma/client');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const prisma = new PrismaClient();
// const PORT = process.env.PORT || 3000;
// const JWT_SECRET = process.env.JWT_SECRET;

// app.use(cors());
// app.use(express.json());

// const generateToken = (user) => {
//   return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
// };

// // Register a new user
// app.post('/register', async (req, res) => {
//   const { email, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);
//   try {
//     const user = await prisma.user.create({
//       data: {
//         email,
//         password: hashedPassword,
//       },
//     });
//     res.status(201).json({ token: generateToken(user) });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Login user
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await prisma.user.findUnique({
//       where: { email },
//     });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ error: 'Invalid email or password' });
//     }
//     res.json({ token: generateToken(user) });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Middleware to authenticate requests
// const authenticate = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'Unauthorized' });

//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(403).json({ error: 'Forbidden' });
//     req.userId = decoded.userId;
//     next();
//   });
// };

// // CRUD operations for tasks
// app.post('/tasks', authenticate, async (req, res) => {
//   const { title, description } = req.body;
//   try {
//     const task = await prisma.task.create({
//       data: {
//         title,
//         description,
//         userId: req.userId,
//       },
//     });
//     res.status(201).json(task);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// app.get('/tasks', authenticate, async (req, res) => {
//   try {
//     const tasks = await prisma.task.findMany({
//       where: { userId: req.userId },
//     });
//     res.status(200).json(tasks);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.get('/tasks/:id', authenticate, async (req, res) => {
//   const { id } = req.params;
//   try {
//     const task = await prisma.task.findUnique({
//       where: { id: parseInt(id), userId: req.userId },
//     });
//     if (!task) return res.status(404).json({ error: 'Task not found' });
//     res.status(200).json(task);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.patch('/tasks/:id', authenticate, async (req, res) => {
//   const { id } = req.params;
//   const { title, description, completed } = req.body;
//   try {
//     const task = await prisma.task.update({
//       where: { id: parseInt(id), userId: req.userId },
//       data: { title, description, completed },
//     });
//     res.status(200).json(task);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// app.delete('/tasks/:id', authenticate, async (req, res) => {
//   const { id } = req.params;
//   try {
//     await prisma.task.delete({
//       where: { id: parseInt(id), userId: req.userId },
//     });
//     res.status(204).end();
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });


require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate and authorize JWT tokens
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// User routes

// Signup
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002' && error.meta && error.meta.target.includes('email')) {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'An error occurred while creating the user' });
    }
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while logging in' });
  }
});

// Get all users
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
});

// Get user by ID
app.get('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the user' });
  }
});

// Update user
app.put('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { email, password } = req.body;
  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.status(200).json(user);
  } catch (error) {
    if (error.code === 'P2002' && error.meta && error.meta.target.includes('email')) {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'An error occurred while updating the user' });
    }
  }
});

// Delete user
app.delete('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the user' });
  }
});


// Task routes
// Create task
app.post('/tasks', authenticateToken, async (req, res) => {
  const { title, description } = req.body;
  const { userId } = req.user;
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the task' });
  }
});

// Get all tasks
app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.userId },
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching tasks' });
  }
});

// Get task by ID
app.get('/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });
    if (task && task.userId === req.user.userId) {
      res.status(200).json(task);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the task' });
  }
});

// Update task
app.put('/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        completed,
      },
    });
    if (task.userId === req.user.userId) {
      res.status(200).json(task);
    } else {
      res.status(403).json({ error: 'You are not authorized to update this task' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the task' });
  }
});

// Delete task
app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });
    if (task && task.userId === req.user.userId) {
      await prisma.task.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the task' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
