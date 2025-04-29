import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export default class Socket {
  constructor(private readonly server: HttpServer) {}

  configure() {
    const io = new Server(this.server, {
      cors: {
        origin: (process.env.ALLOWED_ORIGINS || '').split(', '),
        credentials: true,
      },
    });

    io.on('connection', socket => {
      console.log(socket.id);

      socket.on('join-chat', data => {
        socket.join(data);
        console.log(`User joined the chat ${data}`);
      });

      socket.on('create-chat', (payload) => {
        io.emit('receive-create-chat', payload);
      });

      socket.on('send-message', (payload, chatId) => {
        io.in(chatId).emit('receive-message', payload);
      });

      socket.on('pin-message', (payload, chatId) => {
        io.in(chatId).emit('receive-pin-message', payload);
      });

      socket.on('update-message', (payload, chatId) => {
        io.in(chatId).emit('receive-updated-message', payload);
      });

      socket.on('remove-message', (payload, chatId) => {
        io.in(chatId).emit('receive-removed-message', payload);
      });

      socket.on('send-mark-message-as-read', (chatId, messageId, user) => {
        io.in(chatId).emit('receive-mark-message-as-read', messageId, user);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  }
}
