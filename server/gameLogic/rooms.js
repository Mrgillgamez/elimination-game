const { createGameSession } = require('./models');

// Characters chosen to avoid confusion between similar-looking letters/numbers (no 0/O, 1/I)
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const sessions = new Map(); // roomCode -> session

function generateRoomCode() {
  let code;
  do {
    code = '';
    for (let i = 0; i < 5; i++) {
      code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
    }
  } while (sessions.has(code)); // guarantees no two live rooms share a code
  return code;
}

function createRoom(hostId) {
  const roomCode = generateRoomCode();
  const session = createGameSession(hostId, roomCode);
  sessions.set(roomCode, session);
  return session;
}

function getRoom(roomCode) {
  return sessions.get(roomCode);
}

module.exports = { createRoom, getRoom, sessions };