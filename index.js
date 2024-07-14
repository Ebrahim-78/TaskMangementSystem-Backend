require('dotenv').config();
const express = require('express');
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const taskRoutes = require('./routes/taskRoutes');
const rootRouter = require('./routes/rootRouter');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.use(rootRouter)
// app.use(authRoutes);
// app.use(userRoutes);
// app.use(taskRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
