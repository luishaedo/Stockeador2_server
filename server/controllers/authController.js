const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Generar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Registrar usuario
exports.register = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    const { name, email, password } = req.body;

    // Validación básica antes de interactuar con la base de datos
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("contraseñña hash antes de guardarse", hashedPassword);
    

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generar token
    const token = generateToken(user.id);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Error de validación',
        errors: error.errors.map(err => err.message)
      });
    }

    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

// // Iniciar sesión
// exports.login = async (req, res) => {
//   try {

    
//     const { email, password } = req.body;
//     console.log("Datos recibidos en login:", req.body);

//     if (!email || !password) {
//       return res.status(400).json({ message: "Todos los campos son obligatorios" });
//     }

//     // Buscar usuario
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(401).json({ message: 'Credenciales inválidas' });
//     }

//     console.log("Usuario encontrado:", user.email);
//     console.log("contraseña password",password);
//     console.log("contraseña user.password",user.password);
//     // Verificar si la contraseña en la BD está encriptada
//     if (!user.password.startsWith("$2b$")) {
//       console.log("Error: La contraseña no está encriptada correctamente en la base de datos.");
//       return res.status(500).json({ message: "Error del servidor" });
//     }

//     // Verificar contraseña
//     const isMatch = await bcrypt.compare(password, user.password);
  

//     if (!isMatch) {
//       console.log("Contraseña incorrecta para:", email);
//       return res.status(401).json({ message: 'Credenciales inválidas' });
//     }
//     console.log("Contraseña correcta, generando token...");

//     // Generar token
//     const token = generateToken(user.id);

//     res.json({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       image: user.image,
//       token
//     });

//   } catch (error) {
//     console.error('Error al iniciar sesión:', error);
//     res.status(500).json({ message: 'Error al iniciar sesión' });
//   }
// };

// Iniciar sesión
// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Datos recibidos en login:", req.body);

    if (!email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Buscar usuario en la base de datos
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    console.log("Usuario encontrado:", user.email);
    console.log("➡️ Contraseña ingresada:", password);
    console.log("➡️ Contraseña guardada en la BD:", user.password);

    // Función alternativa isMatch para depuración
    function isMatch(passIngresada, passGuardada) {
      console.log("🔍 Comparando contraseñas sin bcrypt:");
      console.log("➡️ Contraseña ingresada:", passIngresada);
      console.log("➡️ Contraseña guardada en la base de datos:", passGuardada);
      return passIngresada === passGuardada;
    }

    // Comprobación sin bcrypt (prueba)
    if (!isMatch(password, user.password)) {
      console.log("⚠️ Contraseña incorrecta (sin bcrypt)");
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Comprobación con bcrypt (si las contraseñas coinciden en texto plano)
    const matchBcrypt = await bcrypt.compare(password, user.password);
    console.log("✅ bcrypt.compare:", matchBcrypt);

    if (!matchBcrypt) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    console.log("✅ Contraseña correcta, generando token...");

    // Generar token
    const token = generateToken(user.id);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      token
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};






// Obtener perfil de usuario
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};
