const express = require('express');
const http = require('http');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'forged-dev-secret';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const users = new Map();
const rooms = {
  world: [],
  battle_1: [],
  battle_2: [],
  battle_3: [],
  battle_4: []
};

const buildToken = (user) => jwt.sign(
  { id: user.id, username: user.username },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'Forged of the Dragon Games', env: 'phase-1' });
});

app.post('/api/register', async (req, res) => {
  const { username, password, displayName } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const normalizedUsername = username.trim();
  if (users.has(normalizedUsername)) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(36),
    username: normalizedUsername,
    displayName: displayName?.trim() || normalizedUsername,
    passwordHash,
    gold: 12500,
    crystals: 8000,
    trophies: 250,
    realmPower: 1250,
    level: 1,
    createdAt: new Date().toISOString()
  };

  users.set(normalizedUsername, user);
  const token = buildToken(user);

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      gold: user.gold,
      crystals: user.crystals,
      trophies: user.trophies,
      realmPower: user.realmPower,
      level: user.level
    }
  });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  const normalizedUsername = (username || '').trim();
  const user = users.get(normalizedUsername);

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const isValid = await bcrypt.compare(password || '', user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = buildToken(user);

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      gold: user.gold,
      crystals: user.crystals,
      trophies: user.trophies,
      realmPower: user.realmPower,
      level: user.level
    }
  });
});

app.get('/api/me', authMiddleware, (req, res) => {
  const user = [...users.values()].find((entry) => entry.username === req.user.username);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      gold: user.gold,
      crystals: user.crystals,
      trophies: user.trophies,
      realmPower: user.realmPower,
      level: user.level
    }
  });
});

app.get('/api/rooms', (req, res) => {
  const roomList = Object.keys(rooms).map((key, index) => ({
    id: key,
    name: key === 'world' ? 'World Chat' : `Battle Room ${index}`,
    members: 0,
    difficulty: key === 'world' ? 'Open' : `Tier ${index}`
  }));

  res.json({ rooms: roomList });
});

const pushRoomMessage = (room, message) => {
  rooms[room] = rooms[room] || [];
  rooms[room].push(message);

  if (rooms[room].length > 50) {
    rooms[room].shift();
  }
};

io.on('connection', (socket) => {
  socket.on('chat:join', ({ room = 'world', username = 'Guest' }) => {
    socket.join(room);
    socket.data.room = room;
    socket.data.username = username;

    const recentMessages = rooms[room] || [];
    socket.emit('chat:history', { room, messages: recentMessages });
  });

  socket.on('chat:send', ({ room = 'world', username = 'Guest', message = '' }) => {
    const trimmed = String(message).trim();
    if (!trimmed) return;

    const payload = {
      username,
      message: trimmed,
      sentAt: new Date().toISOString()
    };

    pushRoomMessage(room, payload);
    io.to(room).emit('chat:message', payload);
  });

  socket.on('battle:join', ({ room = 'battle_1', username = 'Guest' }) => {
    socket.join(room);
    socket.data.room = room;
    socket.data.username = username;
    io.to(room).emit('battle:joined', {
      username,
      room,
      message: `${username} entered the arena.`
    });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Forged of the Dragon Games running on http://localhost:${PORT}`);
});
