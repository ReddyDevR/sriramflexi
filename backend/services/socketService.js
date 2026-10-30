const socketIo = require('socket.io');
const Notification = require('../models/Notification');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Request = require('../models/Request');

let io = null;
const connectedUsers = new Map();

const initSocket = (server) => {
  io = socketIo(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    pingInterval: 10000,
    pingTimeout: 5000
  });

  io.on('connection', (socket) => {
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

    socket.on('sync:request', async ({ lastTimestamp, role, userId } = {}) => {
      try {
        const since = lastTimestamp ? new Date(lastTimestamp) : new Date(Date.now() - 3600000);
        const visibility = role === 'ADMIN'
          ? { $or: [{ targetRole: 'ADMIN' }, { userId }] }
          : { userId };
        const missed = await Notification.find({ ...visibility, createdAt: { $gt: since } })
          .sort({ createdAt: 1 }).lean();
        socket.emit('sync:response', {
          notifications: missed,
          counters: await getLiveCounters()
        });
      } catch (error) {
        console.error('[Socket sync error]', error);
        socket.emit('sync:response', { notifications: [], counters: null });
      }
    });

    socket.on('disconnect', () => connectedUsers.delete(socket.id));
  });
  return io;
};

const getLiveCounters = async () => {
  const [newOrders, pendingPayments, pendingRequests, unreadAdminNotifications] = await Promise.all([
    Order.countDocuments({ status: 'ORDER_PLACED' }),
    Payment.countDocuments({ status: 'PENDING' }),
    Request.countDocuments({ status: 'PENDING' }),
    Notification.countDocuments({ targetRole: 'ADMIN', read: false })
  ]);
  return { newOrders, pendingPayments, pendingRequests, unreadAdminNotifications, timestamp: Date.now() };
};

const sendLiveCountersToAdmin = async () => {
  if (!io) return;
  try {
    const counters = await getLiveCounters();
    io.to('admin-room').emit('admin:live-counters', counters);
  } catch (error) {
    console.error('[Socket counters error]', error);
  }
};

const broadcastToAdmin = (event, payload) => {
  if (io) {
    io.to('admin-room').emit(event, payload);
    sendLiveCountersToAdmin();
  }
};

const sendToUser = (userId, event, payload) => {
  if (io) io.to(`user:${userId}`).emit(event, payload);
};

module.exports = { initSocket, broadcastToAdmin, sendToUser, sendLiveCountersToAdmin, getLiveCounters };
