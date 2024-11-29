// src/socket/socket.js
import { Server } from 'socket.io';
import ChatService from '../services/chat-service.js';
import { decryptToken } from '../auth/jwt.js';

const chatService = new ChatService();

export default function setupSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (token !== "") {
      const decoded = decryptToken(token);
      socket.user = decoded;
    } else {
      socket.user = undefined;
    }
    next();
  });

  io.on('connection', async (socket) => {
    socket.on('set users', async (data) => {
      const userId = data.users[0];
      const chatId = data.users[1];
      
      if (socket.user === undefined) {
        socket.emit('error', { message: 'Sesion finalizada' });
        socket.disconnect();
        return;
      }
      if (userId != socket.user.id) {
        socket.emit('error', { message: 'ID de usuario no válido' });
        socket.disconnect();
        return;
      }
      
      socket.chatId = chatId;
      await chatService.checkChat(userId, chatId);
      socket.emit('user connected', { userID: userId });
      
      socket.on('chat message', async (data) => {
        const mensaje = data.mensaje;

        try {
          const result = await chatService.createMessage(userId, chatId, mensaje);
          io.emit('chat message', result.rows[0].content, result.rows[0].id.toString(), result.rows[0].sender_user, result.rows[0].date_sent, userId);
        } catch (error) {
          console.error('Error al crear mensaje:', error);
        }
      });

      socket.on('load messages', async (data) => {
        
        const { page, limit } = data;
        try {
          const results = await chatService.loadMessages(chatId, page, limit);
          socket.emit('load messages', results.info, results.rows, results.hasMore);
        } catch (error) {
          console.error('Error al cargar mensajes:', error);
          socket.emit('error', { message: 'Error al cargar mensajes' });
        }
      });
    });
  });

  return io;
}