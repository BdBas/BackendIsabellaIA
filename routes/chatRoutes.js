import express from 'express';
import { getConversation, processMessage } from '../controllers/chatController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Ruta protegida para obtener la conversación del usuario
router.get('/conversation', auth, getConversation);

// Ruta protegida para procesar un nuevo mensaje
router.post('/message', auth, processMessage);

export default router;
