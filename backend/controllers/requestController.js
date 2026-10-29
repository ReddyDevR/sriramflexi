const store = require('../config/store');
const dispatcher = require('../services/notificationDispatcher');

// POST /api/requests/quotation
const createQuotationRequest = async (req, res) => {
  try {
    const { serviceName, dimensions, quantity, description, sampleArtworkUrl, urgency } = req.body;

    if (!serviceName || !description) {
      return res.status(400).json({ message: 'Service name and description are required' });
    }

    const requestDoc = store.create('requests', {
      type: 'QUOTATION',
      priority: urgency === 'HIGH' ? 'URGENT' : 'IMPORTANT',
      customerId: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone || '',
      serviceName,
      dimensions: dimensions || '',
      quantity: quantity || 1,
      description,
      sampleArtworkUrl: sampleArtworkUrl || null,
      status: 'PENDING',
      quotationAmount: null,
      adminNotes: null,
      createdAt: new Date().toISOString()
    });

    // Notify Admin with Real-Time Sound Alert
    dispatcher.dispatch({
      type: 'QUOTATION_CREATED',
      priority: urgency === 'HIGH' ? 'URGENT' : 'IMPORTANT',
      title: `New Quotation Request from ${req.user.name}`,
      message: `${req.user.name} requested a custom price quote for ${serviceName}.`,
      targetRole: 'ADMIN',
      data: {
        requestId: requestDoc._id,
        serviceName,
        customerName: req.user.name,
        actionUrl: `/admin/requests?id=${requestDoc._id}`,
        actionText: 'Provide Quotation'
      },
      idempotencyKey: `quote_req_${requestDoc._id}`
    });

    res.status(201).json({ success: true, request: requestDoc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/requests/my-requests
const getCustomerRequests = async (req, res) => {
  try {
    const requests = store.find('requests', { customerId: req.user._id });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/requests/admin/all
const getAllRequestsAdmin = async (req, res) => {
  try {
    const { type, status } = req.query;
    let requests = store.getCollection('requests');

    if (type && type !== 'ALL') requests = requests.filter(r => r.type === type);
    if (status && status !== 'ALL') requests = requests.filter(r => r.status === status);

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/requests/admin/:id/respond
const adminRespondRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { quotationAmount, adminNotes, status = 'RESOLVED', validityDays = 7 } = req.body;

    const request = store.findById('requests', requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const updated = store.findByIdAndUpdate('requests', requestId, {
      quotationAmount: quotationAmount ? Number(quotationAmount) : request.quotationAmount,
      adminNotes: adminNotes || request.adminNotes,
      validityDays: validityDays || 7,
      status,
      respondedAt: new Date().toISOString(),
      respondedBy: req.user.name
    });

    const isQuotation = request.type === 'QUOTATION' && quotationAmount;

    // Dispatch notification to customer
    dispatcher.dispatch({
      type: isQuotation ? 'QUOTATION_CREATED' : 'SUPPORT',
      priority: 'NORMAL',
      title: isQuotation ? `Quotation Ready: ₹${quotationAmount} for ${request.serviceName}` : `Update on your Request #${requestId}`,
      message: adminNotes || (isQuotation ? `Our team has quoted ₹${quotationAmount} for your requirement.` : 'Admin has responded to your request.'),
      userId: request.customerId,
      customerEmail: request.customerEmail,
      customerName: request.customerName,
      targetRole: 'CUSTOMER',
      data: {
        requestId,
        serviceName: request.serviceName,
        quotationAmount: quotationAmount || null,
        notes: adminNotes || '',
        validityDays,
        actionUrl: `/requests`,
        actionText: isQuotation ? 'View Quotation' : 'View Request'
      },
      idempotencyKey: `req_resp_${requestId}_${Date.now()}`
    });

    res.json({ success: true, request: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/requests/:id/accept-quotation
const customerAcceptQuotation = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = store.findById('requests', requestId);

    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.customerId !== req.user._id) return res.status(403).json({ message: 'Unauthorized' });

    const updated = store.findByIdAndUpdate('requests', requestId, {
      status: 'QUOTATION_ACCEPTED',
      acceptedAt: new Date().toISOString()
    });

    // Notify Admin
    dispatcher.dispatch({
      type: 'QUOTATION_ACCEPTED',
      priority: 'IMPORTANT',
      title: `Quotation Accepted by ${req.user.name}!`,
      message: `${req.user.name} accepted quotation of ₹${request.quotationAmount} for ${request.serviceName}.`,
      targetRole: 'ADMIN',
      data: {
        requestId,
        quotationAmount: request.quotationAmount,
        customerName: req.user.name,
        actionUrl: `/admin/requests?id=${requestId}`,
        actionText: 'Create Order'
      },
      idempotencyKey: `quote_acc_${requestId}`
    });

    res.json({ success: true, message: 'Quotation accepted! Admin notified.', request: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuotationRequest,
  getCustomerRequests,
  getAllRequestsAdmin,
  adminRespondRequest,
  customerAcceptQuotation
};
