import OpenAI from 'openai';
import Conversation from '../models/Conversation.js';
import { getCachedResponse, setCachedResponse } from '../utils/cache.js';
import { generateSystemPrompt } from '../config/prompts.js';
import dotenv from 'dotenv';

dotenv.config();

// Configurar OpenAI
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('La variable de entorno OPENAI_API_KEY no está definida')
  }
  openai = new OpenAI({ apiKey });
  console.log('✅ OpenAI configurado correctamente');
} catch (error) {
  console.error('Error al inicializar OpenAI:', error);
}

// Base de conocimiento de Isabella
const knowledgeBase = {
  sedes: {
    pance: {
      direccion: "Cra. 122 No. 12 – 459, Cali, Valle del Cauca",
      extensiones: "2102 – 2104 – 2106 – 0100",
      descripcion: "Campus Principal"
    },
    melendez: {
      direccion: "Cra. 94 No. 4C – 04, Barrio Meléndez, Cali",
      extensiones: "3112 – 3116 – 3118 – 4100",
      telefono: "+57 (2) 312 0038",
      servicios: "Facultad de Ciencias Administrativas, Cartera Universidad"
    },
    centro: {
      direccion: "Cra. 5 No. 11-42, Centro, Cali",
      extensiones: "3112 – 3114 – 3116 – 3118",
      especialidad: "Programa de Derecho"
    }
  },
  inscripciones: {
    pin: "$94.000 COP",
    cuenta: "Banco de Bogotá, Cuenta Corriente N° 249.038.035",
    whatsapp: "318 4624342",
    telefonos: "310 456 1890 / 321 807 6501",
    portal: "https://inscripciones.unicatolica.edu.co/pregrado/"
  },
  fechas2025: {
    inscripciones: "21 oct 2024 - 22 nov 2024",
    matricula: "1 dic 2024",
    inicioClases: "10 feb 2025",
    finSemestre: "7 jun 2025"
  },
  becas: [
    {
      nombre: "Beca de Excelencia",
      requisito: "Promedio ≥ 4.5",
      beneficio: "30-50% de descuento"
    },
    {
      nombre: "Becas Lumen Gentium",
      requisito: "Estratos 1, 2 y 3",
      beneficio: "Descuentos especiales"
    },
    {
      nombre: "Beca de Reconocimiento a Grupos Representativos",
      requisito: "Participación en grupos culturales/deportivos",
      beneficio: "Porcentaje según convocatoria"
    }
  ]
};

// Función para cargar la conversación de un usuario
export const getConversation = async (req, res) => {
  try {
    // req.user.id viene del middleware de autenticación
    const userId = req.user.id;

    let conversation = await Conversation.findOne({ user: userId }).populate('messages');

    if (!conversation) {
      // Si no existe una conversación, crear una nueva
      conversation = new Conversation({ user: userId, messages: [] });
      await conversation.save();
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error loading conversation:', error);
    res.status(500).json({ message: 'Error al cargar la conversación' });
  }
};

// Función para procesar el mensaje del usuario
export const processMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id; // Obtener ID del usuario autenticado

    if (!message) {
      return res.status(400).json({ message: 'El mensaje es requerido' });
    }

    // 1. Encontrar o crear la conversación del usuario
    let conversation = await Conversation.findOne({ user: userId });

    if (!conversation) {
      conversation = new Conversation({ user: userId, messages: [] });
    }

    // 2. Añadir el mensaje del usuario a la conversación
    conversation.messages.push({ sender: 'user', text: message });

    // 3. Preparar mensajes para OpenAI (incluir historial reciente si se desea)
    // Por ahora, enviaremos solo el mensaje actual más el system prompt.
    // Para incluir historial, habría que recuperar mensajes anteriores de conversation.messages
    const messagesForOpenAI = [
      { role: "system", content: generateSystemPrompt(knowledgeBase) }, // Usar la base de conocimiento si es necesaria para el system prompt
      { role: "user", content: message }
    ];

    // 4. Llamar a OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'API key de OpenAI no configurada' });
    }

    const openAIResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // O el modelo que estés usando
      messages: messagesForOpenAI,
      temperature: 0.7,
    });

    const aiResponseText = openAIResponse.choices?.[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

    // 5. Añadir la respuesta de la IA a la conversación
    conversation.messages.push({ sender: 'isabella', text: aiResponseText });

    // 6. Guardar la conversación actualizada
    await conversation.save();

    // 7. Enviar la respuesta de la IA al frontend
    res.json({ response: aiResponseText });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ message: 'Error al procesar el mensaje' });
  }
};

// Exportar las funciones del controlador
// export { processMessage, getConversation }; // Asegurarse de exportar ambas si se usan rutas separadas
