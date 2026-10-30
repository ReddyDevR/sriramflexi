const Request = require('../models/Request');
const dispatcher = require('../services/notificationDispatcher');

// POST /api/requests/quotation
const createQuotationRequest = async (req, res) => {
  try {
    const { serviceName, dimensions, description, attachments } = req.body;
    if (!serviceName || !description) return res.status(400).json({ message: 'Service name and description are required' });
    const request = await Request.create({ type: 'QUOTATION', priority: 'HIGH', customerId: String(req.user._id), customerName: req.user.name, customerEmail: req.user.email, customerPhone: req.user.phone || '', serviceName, dimensions: dimensions || null, description, attachments: Array.isArray(attachments) ? attachments : [], status: 'PENDING' });
    dispatcher.dispatch({ type: 'CUSTOMER_REQUEST', priority: 'IMPORTANT', title: `New Quotation Request: ${serviceName}`, message: `${req.user.name} requested a quotation for ${serviceName}.`, targetRole: 'ADMIN', data: { requestId: request._id, serviceName, customerName: req.user.name, actionUrl: `/admin/requests?id=${request._id}`, actionText: 'Provide Quotation' }, idempotencyKey: `quote_req_${request._id}` });
    return res.status(201).json({ success: true, request });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// GET /api/requests/my-requests
const getCustomerRequests = async (req, res) => {
  try { const requests = await Request.find({ customerId: String(req.user._id) }).sort({ createdAt: -1 }); return res.json({ success: true, requests }); }
  catch (error) { return res.status(500).json({ message: error.message }); }
};

// GET /api/requests/admin/all
const getAllRequestsAdmin = async (req, res) => {
  try { const filter = {}; if (req.query.type && req.query.type !== 'ALL') filter.type = req.query.type; if (req.query.status && req.query.status !== 'ALL') filter.status = req.query.status; const requests = await Request.find(filter).sort({ createdAt: -1 }); return res.json({ success: true, requests }); }
  catch (error) { return res.status(500).json({ message: error.message }); }
};

// PUT /api/requests/admin/:id/respond
const adminRespondRequest = async (req, res) => {
  try {
    const { quotationAmount, adminNotes, status = 'RESOLVED', validityDays = 7 } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    const updated = await Request.findByIdAndUpdate(request._id, { $set: { quotationAmount: quotationAmount !== undefined && quotationAmount !== '' ? Number(quotationAmount) : request.quotationAmount, adminNotes: adminNotes || request.adminNotes, validityDays: Number(validityDays) || 7, status, respondedAt: new Date(), respondedBy: req.user.name } }, { new: true, runValidators: true });
    const isQuotation = request.type === 'QUOTATION' && quotationAmount !== undefined && quotationAmount !== '';
    dispatcher.dispatch({ type: isQuotation ? 'QUOTATION_CREATED' : 'SUPPORT', priority: 'NORMAL', title: isQuotation ? `Quotation Ready: ₹${quotationAmount} for ${request.serviceName}` : `Update on your Request #${request._id}`, message: adminNotes || (isQuotation ? `Our team has quoted ₹${quotationAmount} for your requirement.` : 'Admin has responded to your request.'), userId: request.customerId, customerEmail: request.customerEmail, customerName: request.customerName, targetRole: 'CUSTOMER', data: { requestId: request._id, serviceName: request.serviceName, quotationAmount: quotationAmount || null, notes: adminNotes || '', validityDays, actionUrl: '/requests', actionText: isQuotation ? 'View Quotation' : 'View Request' }, idempotencyKey: `req_resp_${request._id}_${Date.now()}` });
    return res.json({ success: true, request: updated });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// PUT /api/requests/:id/accept-quotation
const customerAcceptQuotation = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (String(request.customerId) !== String(req.user._id)) return res.status(403).json({ message: 'Unauthorized' });
    if (request.type !== 'QUOTATION') return res.status(400).json({ message: 'This request is not a quotation' });
    const updated = await Request.findByIdAndUpdate(request._id, { $set: { status: 'QUOTATION_ACCEPTED', acceptedAt: new Date() } }, { new: true });
    dispatcher.dispatch({ type: 'QUOTATION_ACCEPTED', priority: 'IMPORTANT', title: `Quotation Accepted by ${req.user.name}!`, message: `${req.user.name} accepted quotation of ₹${request.quotationAmount} for ${request.serviceName}.`, targetRole: 'ADMIN', data: { requestId: request._id, quotationAmount: request.quotationAmount, customerName: req.user.name, actionUrl: `/admin/requests?id=${request._id}`, actionText: 'Create Order' }, idempotencyKey: `quote_acc_${request._id}` });
    return res.json({ success: true, message: 'Quotation accepted! Admin notified.', request: updated });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

module.exports = { createQuotationRequest, getCustomerRequests, getAllRequestsAdmin, adminRespondRequest, customerAcceptQuotation };
