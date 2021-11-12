import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export const app = express();
export const server = createServer(app);
export const io = new SocketIOServer(server);

export function getUserIdFromSocket(socket: Socket): string | undefined {
	return ((socket.request as express.Request).session as any).passport?.user;
}

io.on('connection', (socket) => {
	const userId = getUserIdFromSocket(socket);
	if (userId) {
		socket.join(userId);
	}
});
