import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Función para generar token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

// Registro de usuario
export const register = async (req, res) => {
  console.log('Attempting user registration...'); // Log al inicio
  console.log('Request body:', req.body); // Log del cuerpo de la petición
  try {
    const { email, password, name, role, studentId } = req.body;

    console.log('Checking if user already exists with email:', email); // Log antes de buscar usuario
    const existingUser = await User.findOne({ email });
    console.log('Existing user check result:', existingUser); // Log después de buscar usuario

    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Crear nuevo usuario
    const user = new User({
      email,
      password,
      name,
      role,
      studentId
    });

    console.log('New user created successfully:', user); // Log después de crear usuario
    console.log('Saving new user... About to call user.save()'); // **Nuevo log** antes de guardar usuario
    await user.save();
    console.log('User saved successfully.'); // Log después de guardar usuario

    console.log('Attempting to generate token for user ID:', user._id); // Log antes de generar token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables!'); // Log si JWT_SECRET falta
    } else {
      console.log('JWT_SECRET is defined. Length:', process.env.JWT_SECRET.length); // Log si JWT_SECRET está definido
    }

    const token = generateToken(user._id);
    console.log('Token generated successfully.'); // Log después de generar token

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during user registration:', error); // Log el objeto de error completo
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

// Inicio de sesión
export const login = async (req, res) => {
  console.log('Attempting user login...'); // Log al inicio de login
  try {
    const { email, password } = req.body;

    console.log('Searching for user with email:', email); // Log antes de buscar usuario
    // Buscar usuario
    const user = await User.findOne({ email });
    console.log('User found result:', user ? 'User found' : 'User not found'); // Log después de buscar usuario

    if (!user) {
      console.log('Login failed: User not found.'); // Log si usuario no encontrado
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    console.log('Comparing password for user:', user.email); // Log antes de comparar contraseña
    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch); // Log después de comparar contraseña

    if (!isMatch) {
      console.log('Login failed: Password mismatch.'); // Log si contraseña incorrecta
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    console.log('Login successful, updating last login.'); // Log antes de actualizar lastLogin
    // Actualizar último inicio de sesión
    user.lastLogin = new Date();
    await user.save();
    console.log('Last login updated.'); // Log después de actualizar lastLogin

    console.log('Attempting to generate token for user ID:', user._id); // Log antes de generar token
    // Generar token
    const token = generateToken(user._id);
    console.log('Token generated successfully during login.'); // Log después de generar token

    console.log('Login successful, sending response.'); // Log antes de enviar respuesta
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

// Obtener perfil del usuario
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
}; 