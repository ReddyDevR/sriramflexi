const DB_FILE = path.join(
  __dirname,
  '..',
  'data',
  'db.json'
);
const { isDbConnected } = require('./db');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

// Default initial state
const defaultState = {
  users: [],
  categories: [],
  products: [],
  orders: [],
  payments: [],
  requests: [],
  coupons: [],
  notifications: [],
  notificationPreferences: [],
  pushSubscriptions: [],
  notificationDeliveryLogs: [],
  emailLogs: [],
  announcements: [],
  notificationSettings: {
    ORDER_CREATED: { inApp: true, push: true, email: true, adminSound: true, adminEmail: true },
    ORDER_ACCEPTED: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false },
    ORDER_UPDATED: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false },
    ORDER_CANCELLED: { inApp: true, push: true, email: true, adminSound: true, adminEmail: true },
    ORDER_REJECTED: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false },
    ORDER_COMPLETED: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false },
    PAYMENT_SUBMITTED: { inApp: true, push: true, email: true, adminSound: true, adminEmail: true },
    PAYMENT_VERIFIED: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false },
    PAYMENT_REJECTED: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false },
    QUOTATION_CREATED: { inApp: true, push: true, email: true, adminSound: true, adminEmail: true },
    QUOTATION_UPDATED: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false },
    QUOTATION_ACCEPTED: { inApp: true, push: true, email: true, adminSound: true, adminEmail: true },
    CUSTOMER_REQUEST: { inApp: true, push: true, email: true, adminSound: true, adminEmail: true },
    DESIGN_UPDATE: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false },
    PRINTING_STARTED: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false },
    PRINTING_COMPLETED: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false },
    READY_FOR_PICKUP: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false },
    OUT_FOR_DELIVERY: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false },
    DELIVERED: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false },
    REFUND: { inApp: true, push: true, email: true, adminSound: true, adminEmail: true },
    COUPON: { inApp: true, push: true, email: false, adminSound: false, adminEmail: false },
    OFFER: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false },
    SUPPORT: { inApp: true, push: true, email: true, adminSound: true, adminEmail: true },
    SYSTEM: { inApp: true, push: true, email: false, adminSound: false, adminEmail: false },
    ADMIN_ALERT: { inApp: true, push: false, email: true, adminSound: true, adminEmail: true },
    WELCOME: { inApp: true, push: true, email: true, adminSound: false, adminEmail: false }
  }
};

class MemoryStore {
  constructor() {
    this.data = { ...defaultState };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = { ...defaultState, ...parsed };
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading db.json, using default state', e);
      this.data = { ...defaultState };
    }
  }

  save() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving db.json', e);
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  find(collectionName, query = {}) {
    const list = this.getCollection(collectionName);
    return list.filter(item => {
      for (const key of Object.keys(query)) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(collectionName, query = {}) {
    const list = this.getCollection(collectionName);
    return list.find(item => {
      for (const key of Object.keys(query)) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    }) || null;
  }

  findById(collectionName, id) {
    const list = this.getCollection(collectionName);
    return list.find(item => String(item._id || item.id) === String(id)) || null;
  }

  create(collectionName, doc) {
    const list = this.getCollection(collectionName);
    const newDoc = {
      _id: doc._id || 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    list.unshift(newDoc);
    this.save();
    return newDoc;
  }

  findByIdAndUpdate(collectionName, id, update) {
    const list = this.getCollection(collectionName);
    const idx = list.findIndex(item => String(item._id || item.id) === String(id));
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...update,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return list[idx];
  }

  updateOne(collectionName, query, update) {
    const item = this.findOne(collectionName, query);
    if (!item) return null;
    return this.findByIdAndUpdate(collectionName, item._id || item.id, update);
  }

  deleteById(collectionName, id) {
    const list = this.getCollection(collectionName);
    const idx = list.findIndex(item => String(item._id || item.id) === String(id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    this.save();
    return true;
  }

  count(collectionName, query = {}) {
    return this.find(collectionName, query).length;
  }

  getSettings() {
    return this.data.notificationSettings;
  }

  updateSettings(newSettings) {
    this.data.notificationSettings = {
      ...this.data.notificationSettings,
      ...newSettings
    };
    this.save();
    return this.data.notificationSettings;
  }
}

const store = new MemoryStore();
module.exports = store;
