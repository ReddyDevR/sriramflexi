const socketIo = require('socket.io');
const store = require('../config/store');

let io = null;
const connectedUsers = new Map(); // socketId -> { userId, role }

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    pingInterval: 10000,
    pingTimeout: 5000
  });

  io.on('connection', (socket) => {
    // Client authentication and room joining
    socket.on('authenticate', (data) => {
      const { userId, role } = data || {};
      if (userId) {
        connectedUsers.set(socket.id, { userId, role });
        socket.join(`user:${userId}`);

        if (role === 'ADMIN') {
          socket.join('admin-room');
          console.log(`[Socket] Admin joined admin-room: socket ${socket.id}`);
          sendLiveCountersToAdmin();
        }
      }
    });

    // Reconnection missed notifications sync
    socket.on('sync:request', ({ lastTimestamp, role, userId }) => {
      const since = lastTimestamp || new Date(Date.now() - 3600000).toISOString();
      const allNotifs = store.getCollection('notifications');
      
      const missed = allNotifs.filter(n => {
        const matchesTarget = (role === 'ADMIN' && n.targetRole === 'ADMIN') || (n.userId === userId);
        const matchesTime = n.createdAt > since;
        return matchesTarget && matchesTime;
      });

      socket.emit('sync:response', {
        notifications: missed,
        counters: getLiveCounters()
      });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
    });
  });

  return io;
};

const getLiveCounters = () => {
  const newOrders = store.find('orders', { status: 'ORDER_PLACED' }).length;
  const pendingPayments = store.find('payments', { status: 'PENDING' }).length;
  const pendingRequests = store.find('requests', { status: 'PENDING' }).length;
  const unreadAdminNotifications = store.getCollection('notifications').filter(n => n.targetRole === 'ADMIN' && !n.read).length;

  return {
    newOrders,
    pendingPayments,
    pendingRequests,
    unreadAdminNotifications,
    timestamp: Date.now()
  };
};

const sendLiveCountersToAdmin = () => {
  if (io) {
    const counters = getLiveCounters();
    io.to('admin-room').emit('admin:live-counters', counters);
  }
};

const broadcastToAdmin = (event, payload) => {
  if (io) {
    io.to('admin-room').emit(event, payload);
    sendLiveCountersToAdmin();
  }
};

const sendToUser = (userId, event, payload) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
  }
};

module.exports = {
  initSocket,
  broadcastToAdmin,
  sendToUser,
  sendLiveCountersToAdmin,
  getLiveCounters
};
