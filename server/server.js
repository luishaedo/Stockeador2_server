const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require("./routes/productRoutes");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;




// Al inicio de server/server.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Para ver los datos del cuerpo de la petición
app.use((req, res, next) => {
  if (req.method === 'POST' && req.url.includes('/api/auth')) {
    console.log('Datos recibidos en el servidor:', req.body);
  }
  next();
});
///hasta aqui las pruebas

// Middleware
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', "http://localhost:5173"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use("/api/products", productRoutes)

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Sincronizar modelos con la base de datos
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
};

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  await syncDatabase();
});