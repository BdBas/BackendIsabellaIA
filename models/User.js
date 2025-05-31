import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  studentId: {
    type: String,
    trim: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Método para encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  console.log('--> START pre-save middleware'); // Log al inicio del middleware
  console.log('Middleware pre-save triggered for user:', this.email); // Log al inicio del middleware
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hashing.'); // Log si la contraseña no fue modificada
    return next();
  }

  console.log('Password modified, attempting to hash.'); // Log antes de hashear
  try {
    console.log('Generating salt...'); // Log antes de generar salt
    const salt = await bcrypt.genSalt(10);
    console.log('Salt generated.'); // Log después de generar salt

    console.log('Hashing password...'); // Log antes de hashear contraseña
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully.'); // Log después de hashear contraseña

    next();
  } catch (error) {
    console.error('Error in pre-save middleware:', error); // Log si ocurre un error
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User; 