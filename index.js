const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();

// Middleware para analizar el cuerpo de la solicitud
app.use(express.json());
// Middleware para permitir CORS
app.use(cors());

// Conexión a la base de datos MongoDB
 mongoose.connect(process.env.DB_CNN)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Esquema y modelo de usuario
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Ruta para registrar un nuevo usuario
const generateToken = (userId) => {
  // Generar el token JWT con el ID de usuario y la clave secreta
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' }); // expiresIn es opcional, define el tiempo de expiración del token
};

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
   
    // Crear un nuevo usuario
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Generar el token JWT
    const token = generateToken(newUser._id); // Suponiendo que el ID del usuario es _id

    // Eliminar el usuario anterior
    await User.deleteMany({ createdAt: { $lt: newUser.createdAt } });

    // Enviar la respuesta con el token
    res.status(201).json({ message: 'User registered successfully', token });
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


// Iniciar el servidor
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

