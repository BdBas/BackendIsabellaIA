import express from 'express';
import cors from 'cors';
// Eliminar la importación de OpenAI si no se usa directamente aquí
// import { OpenAI } from 'openai'; // ELIMINAR si no se usa
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; // Importar las rutas de chat

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Eliminar el Modelo para los resultados de trivia
// const triviaResultSchema = new mongoose.Schema({ ... }); // ELIMINAR
// const TriviaResult = mongoose.model('TriviaResult', triviaResultSchema); // ELIMINAR

// Eliminar la Configuración de OpenAI si no se usa directamente aquí
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // ELIMINAR si no se usa

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes); // Agregar las rutas de chat

// Eliminar los Endpoints de trivia obsoletos
// app.post('/api/generate-questions', async (req, res) => { ... }); // ELIMINAR
// app.post('/api/save-results', async (req, res) => { ... }); // ELIMINAR
// app.get('/api/results', async (req, res) => { ... }); // ELIMINAR

// Eliminar la Ruta de prueba obsoleta si ya no es necesaria
// app.get('/', (req, res) => { res.json({ message: 'API de Trivia funcionando' }); }); // ELIMINAR o reemplazar

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});