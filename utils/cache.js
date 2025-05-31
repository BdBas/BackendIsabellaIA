// Sistema de caché simple para respuestas frecuentes
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora en milisegundos

export const getCachedResponse = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.response;
  }
  return null;
};

export const setCachedResponse = (key, response) => {
  cache.set(key, {
    response,
    timestamp: Date.now()
  });
};

// Limpiar caché expirado cada hora
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}, CACHE_DURATION); 