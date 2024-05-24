const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

 mongoose.connect(process.env.DB_CNN)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      existingUser.email = email;
      existingUser.password = hashedPassword;
      await existingUser.save();
      
      return res.status(200).json({ message: 'User details updated successfully', user: existingUser });
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
   
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error });
  }
});

app.get('/getLastUser', async (req, res) => {
  try {
    const lastUser = await User.findOne().sort({ createdAt: -1 });

    if (!lastUser) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json({ username: lastUser.username });
  } catch (error) {
    console.error('Error fetching last user:', error);
    res.status(500).json({ message: 'Error fetching last user', error });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

