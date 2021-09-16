import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export const app = express();
export const server = createServer(app);
export const io = new SocketIOServer(server);

export function getUserIdFromSocket(socket: Socket) {
	// @ts-ignore the session is shared with socket.io so request.session.passport.user is the user's ID
	return socket.request.session.passport?.user;
}

io.on('connection', socket => {
	const userId = getUserIdFromSocket(socket);
	socket.join(userId);
});
