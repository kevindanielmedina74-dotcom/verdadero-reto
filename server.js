// server.js
// Servidor backend para "Verdadero Reto"
// Guarda las salas en memoria (se pierden si reinicias el servidor).

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Permite leer JSON en el body de las peticiones POST
app.use(express.json());

// Sirve los archivos estáticos (index.html, etc.) desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Almacén de salas en memoria: { CODIGO: { ...datosDeLaSala } }
const rooms = {};

// Elimina salas viejas (más de 6 horas) cada 30 minutos, para no acumular basura
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const code of Object.keys(rooms)) {
    if (rooms[code].createdAt && now - rooms[code].createdAt > ROOM_TTL_MS) {
      delete rooms[code];
    }
  }
}, 30 * 60 * 1000);

// GET /api/room?code=ABCD  -> devuelve el estado actual de la sala
app.get('/api/room', (req, res) => {
  const code = (req.query.code || '').toString().toUpperCase();
  if (!code || !rooms[code]) {
    return res.status(404).json({ error: 'Sala no encontrada' });
  }
  res.json(rooms[code]);
});

// POST /api/room  { code, room }  -> crea o actualiza la sala completa
app.post('/api/room', (req, res) => {
  const { code, room } = req.body || {};
  if (!code || typeof room !== 'object') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  rooms[code.toString().toUpperCase()] = room;
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
