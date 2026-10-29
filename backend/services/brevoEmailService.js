const https = require('https');
const store = require('../config/store');

const getBrevoConfig = () => ({
  apiKey: process.env.BREVO_API_KEY || '',
  senderEmail: process.env.BREVO_SENDER_EMAIL || 'notifications@sriramuprinting.com',
  senderName: process.env.BREVO_SENDER_NAME || 'Sri Ramu Digital — Flex & Offset Printing',
  replyToEmail: process.env.BREVO_REPLY_TO_EMAIL || 'support@sriramuprinting.com',
  businessName: process.env.BUSINESS_NAME || 'Sri Ramu Digital — Flex & Offset Printing',
  businessPhone: process.env.BUSINESS_PHONE || '+91 98480 12345',
  businessEmail: process.env.BUSINESS_EMAIL || 'support@sriramuprinting.com',
  businessAddress: process.env.BUSINESS_ADDRESS || 'Main Road, Opp. Municipal Complex, Digital Arts Zone, Guntur, AP - 522002',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
});

// Interpolate template variables: {{variableName}}
const interpolateTemplate = (html, variables) => {
  let result = html;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value !== undefined && value !== null ? String(value) : '');
  }
  return result;
};

// Base HTML wrapper with responsive styling
const wrapEmailTemplate = ({ title, preheader, bodyContent, variables }) => {
  const config = getBrevoConfig();
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; color: #1e293b; -webkit-font-smoothing: antialiased; }
    .wrapper { max-width: 620px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #bae6fd; letter-spacing: 0.5px; text-transform: uppercase; font-weight: 600; }
    .badge-bar { display: inline-block; padding: 6px 14px; background: rgba(255,255,255,0.18); border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 12px; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .order-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .order-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 14px; }
    .order-row:last-child { border-bottom: none; font-weight: 700; font-size: 16px; color: #0284c7; }
    .action-btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 28px; font-weight: 600; font-size: 14px; border-radius: 6px; margin: 20px 0 10px; text-align: center; box-shadow: 0 2px 6px rgba(2,132,199,0.35); }
    .footer { background: #0f172a; padding: 24px; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.7; }
    .footer a { color: #38bdf8; text-decoration: none; }
    .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .status-badge.green { background: #dcfce7; color: #15803d; }
    .status-badge.amber { background: #fef3c7; color: #b45309; }
    .status-badge.red { background: #fee2e2; color: #b91c1c; }
    .status-badge.blue { background: #e0f2fe; color: #0369a1; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden">${preheader}</div>
  <div class="wrapper">
    <div class="header">
      <h1>${config.businessName}</h1>
      <p>High-Quality Flex, Vinyl, Glow Sign & Offset Printing</p>
      <div class="badge-bar">Official Communication</div>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px; color: #f8fafc; font-weight: 600;">${config.businessName}</p>
      <p style="margin: 0 0 8px;">${config.businessAddress}</p>
      <p style="margin: 0 0 12px;">Phone: <strong>${config.businessPhone}</strong> | Email: <strong>${config.businessEmail}</strong></p>
      <div style="height:1px; background:#334155; margin:16px auto; max-width:240px;"></div>
      <p style="margin:0; font-size:11px;">&copy; ${year} Sri Ramu Digital. All rights reserved. Registered commercial flex & offset press.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Reusable email templates
const EMAIL_TEMPLATES = {
  WELCOME: {
    subject: 'Welcome to Sri Ramu Digital — Your Premier Printing Partner',
    render: (v) => wrapEmailTemplate({
      title: 'Welcome to Sri Ramu Digital',
      preheader: `Hello ${v.customerName}, welcome to Sri Ramu Digital Printing Solutions.`,
      bodyContent: `
        <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Welcome, ${v.customerName}! 🎉</h2>
        <p>Thank you for creating an account with <strong>Sri Ramu Digital — Flex & Offset Printing</strong>. We are thrilled to be your one-stop partner for all wide-format flex printing, vinyl signage, corporate offset stationery, visiting cards, LED boards, and promotional materials.</p>
        
        <div class="order-box">
          <div style="font-weight: 700; margin-bottom: 10px; color: #0369a1;">Your Account Credentials & Details:</div>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Account Name:</strong> ${v.customerName}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${v.customerEmail || 'Registered Customer'}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Printing Services:</strong> Frontlit Flex, Star Backlit, Glow Sign Boards, Visiting Cards, Brochures & Standees</p>
        </div>

        <p>You can now browse our catalog, calculate instant print pricing with custom dimensions and GSM, submit artwork, and track real-time printing stages right from your dashboard.</p>
        
        <div style="text-align: center;">
          <a href="${v.orderLink || v.clientUrl || 'http://localhost:5173'}" class="action-btn">Explore Printing Catalog</a>
        </div>

        <div class="divider"></div>
        <p style="font-size: 13px; color: #64748b;">Need urgent assistance or bulk quotation? Contact our print desk at <strong>${v.businessPhone}</strong> or reply directly to this email.</p>
      `,
      variables: v
    })
  },

  ORDER_CREATED: {
    subject: 'Order Confirmed: #{{orderId}} — Sri Ramu Digital Printing',
    render: (v) => wrapEmailTemplate({
      title: 'Order Confirmation',
      preheader: `Thank you for your printing order #${v.orderId}. Your order has been placed successfully.`,
      bodyContent: `
        <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Order Placed Successfully! 📄</h2>
        <p>Dear <strong>${v.customerName}</strong>, thank you for choosing Sri Ramu Digital. Your order <strong>#${v.orderId}</strong> has been logged in our print management system.</p>

        <div class="order-box">
          <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <span style="font-weight: 700; color: #0f172a;">Order Summary: #${v.orderId}</span>
            <span class="status-badge blue">${v.orderStatus || 'ORDER_PLACED'}</span>
          </div>
          <div class="order-row"><span>Date & Time:</span><span>${v.orderDate || new Date().toLocaleString()}</span></div>
          <div class="order-row"><span>Selected Products:</span><span>${v.serviceName || 'Custom Print Job'}</span></div>
          <div class="order-row"><span>Quantity / Units:</span><span>${v.quantity || 1}</span></div>
          <div class="order-row"><span>Subtotal:</span><span>₹${v.subtotal || v.totalAmount}</span></div>
          ${v.discount ? `<div class="order-row" style="color:#15803d;"><span>Coupon Discount (${v.couponCode || 'APPLIED'}):</span><span>-₹${v.discount}</span></div>` : ''}
          <div class="order-row"><span>Payment Mode:</span><span>${v.paymentMode || 'Online / UPI'}</span></div>
          <div class="order-row"><span>Payment Status:</span><span>${v.paymentStatus || 'PENDING'}</span></div>
          <div class="order-row"><span>Final Payable Amount:</span><span>₹${v.totalAmount}</span></div>
        </div>

        ${v.customerNotes ? `<p style="background:#fefce8; padding:12px; border-left:4px solid #eab308; border-radius:4px; font-size:13px;"><strong>Customer Notes / Print Instructions:</strong> ${v.customerNotes}</p>` : ''}

        <p>Our production team is reviewing your print specifications and design files. You will receive live status updates at every stage (Design Proof -> Offset/Flex Machine -> Finishing -> Pickup/Delivery).</p>

        <div style="text-align: center;">
          <a href="${v.orderLink || 'http://localhost:5173/orders'}" class="action-btn">Track Order Details</a>
        </div>
      `,
      variables: v
    })
  },

  PAYMENT_SUBMITTED: {
    subject: 'Payment Received for Order #{{orderId}} — Waiting for Verification',
    render: (v) => wrapEmailTemplate({
      title: 'Payment Verification in Progress',
      preheader: `Payment details submitted for order #${v.orderId}. We are verifying your transaction.`,
      bodyContent: `
        <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Payment Details Received 💳</h2>
        <p>Hello <strong>${v.customerName}</strong>, we have received your payment verification submission for Order <strong>#${v.orderId}</strong>.</p>

        <div class="order-box">
          <div class="order-row"><span>Order ID:</span><span>#${v.orderId}</span></div>
          <div class="order-row"><span>Amount Submitted:</span><span>₹${v.paymentAmount || v.totalAmount}</span></div>
          <div class="order-row"><span>Payment Mode:</span><span>${v.paymentMode || 'UPI / QR / Bank Transfer'}</span></div>
          ${v.transactionId ? `<div class="order-row"><span>Transaction / UTR Reference:</span><span>${v.transactionId}</span></div>` : ''}
          <div class="order-row"><span>Submitted At:</span><span>${new Date().toLocaleString()}</span></div>
          <div class="order-row"><span>Verification Status:</span><span class="status-badge amber">PENDING VERIFICATION</span></div>
        </div>

        <p>Our accounts team verifies transactions swiftly (usually within 15–30 minutes during business hours). Once verified, your print order will immediately advance to the prepress & printing queue.</p>

        <div style="text-align: center;">
          <a href="${v.orderLink || 'http://localhost:5173/orders'}" class="action-btn">View Payment Status</a>
        </div>
      `,
      variables: v
    })
  },

  PAYMENT_VERIFIED: {
    subject: 'Payment Verified: ₹{{paymentAmount}} for Order #{{orderId}} — Sri Ramu Digital',
    render: (v) => wrapEmailTemplate({
      title: 'Payment Confirmed',
      preheader: `Payment of ₹${v.paymentAmount} has been verified for order #${v.orderId}.`,
      bodyContent: `
        <h2 style="font-size: 20px; color: #15803d; margin-top: 0;">Payment Verified Successfully! ✅</h2>
        <p>Dear <strong>${v.customerName}</strong>, your payment for Order <strong>#${v.orderId}</strong> has been officially confirmed by our accounts desk.</p>

        <div class="order-box">
          <div class="order-row"><span>Order ID:</span><span>#${v.orderId}</span></div>
          <div class="order-row"><span>Verified Amount:</span><span style="color:#15803d; font-weight:700;">₹${v.paymentAmount || v.totalAmount}</span></div>
          <div class="order-row"><span>Payment Mode:</span><span>${v.paymentMode || 'UPI / Bank Transfer'}</span></div>
          ${v.transactionId ? `<div class="order-row"><span>Transaction / UTR:</span><span>${v.transactionId}</span></div>` : ''}
          <div class="order-row"><span>Verified Date:</span><span>${new Date().toLocaleString()}</span></div>
          <div class="order-row"><span>Current Order Status:</span><span class="status-badge green">${v.orderStatus || 'PAYMENT_VERIFIED'}</span></div>
        </div>

        <p>Your order is now queued for active printing and finishing. You will receive further notifications as your job enters the print press.</p>

        <div style="text-align: center;">
          <a href="${v.orderLink || 'http://localhost:5173/orders'}" class="action-btn">View Order Timeline</a>
        </div>
      `,
      variables: v
    })
  },

  PAYMENT_REJECTED: {
    subject: 'Important: Payment Verification Update for Order #{{orderId}}',
    render: (v) => wrapEmailTemplate({
      title: 'Payment Verification Issue',
      preheader: `We could not verify the payment for order #${v.orderId}. Please review details.`,
      bodyContent: `
        <h2 style="font-size: 20px; color: #b91c1c; margin-top: 0;">Payment Verification Rejected ⚠️</h2>
        <p>Dear <strong>${v.customerName}</strong>, our accounts team was unable to verify the payment submitted for Order <strong>#${v.orderId}</strong>.</p>

        <div class="order-box" style="border-color:#fca5a5; background:#fff5f5;">
          <div class="order-row"><span>Order ID:</span><span>#${v.orderId}</span></div>
          <div class="order-row"><span>Attempted Amount:</span><span>₹${v.paymentAmount || v.totalAmount}</span></div>
          <div class="order-row"><span style="color:#b91c1c; font-weight:700;">Rejection Reason:</span><span style="color:#b91c1c; font-weight:700;">${v.rejectionReason || 'Transaction reference mismatch or uncredited amount.'}</span></div>
        </div>

        <p>Please double-check your bank UTR / transaction screenshot and resubmit your payment details so we can proceed with printing your order without delay.</p>

        <div style="text-align: center;">
          <a href="${v.orderLink || 'http://localhost:5173/orders'}" class="action-btn" style="background:#dc2626;">Retry / Resubmit Payment</a>
        </div>
      `,
      variables: v
    })
  },

  ORDER_ACCEPTED: {
    subject: 'Order Accepted & Production Scheduled: #{{orderId}}',
    render: (v) => wrapEmailTemplate({
      title: 'Order Accepted',
      preheader: `Your order #${v.orderId} has been accepted and scheduled for printing.`,
      bodyContent: `
        <h2 style="font-size: 20px; color: #0284c7; margin-top: 0;">Order Accepted for Production! 🖨️</h2>
        <p>Dear <strong>${v.customerName}</strong>, Sri Ramu Digital has accepted your order <strong>#${v.orderId}</strong>.</p>

        <div class="order-box">
          <div class="order-row"><span>Order ID:</span><span>#${v.orderId}</span></div>
          <div class="order-row"><span>Product / Service:</span><span>${v.serviceName || 'Print Job'}</span></div>
          <div class="order-row"><span>Current Stage:</span><span class="status-badge blue">ORDER ACCEPTED</span></div>
          <div class="order-row"><span>Expected Next Stage:</span><span>Prepress & Design Proofing / Machine Setup</span></div>
        </div>

        <p>Our technicians are preparing the high-resolution plates and media for your job.</p>

        <div style="text-align: center;">
          <a href="${v.orderLink || 'http://localhost:5173/orders'}" class="action-btn">Track Order Live</a>
        </div>
      `,
      variables: v
    })
  },

  ORDER_STATUS_UPDATED: {
    subject: 'Order Status Update: #{{orderId}} is now {{orderStatus}}',
    render: (v) => wrapEmailTemplate({
      title: 'Order Status Update',
      preheader: `Update on your order #${v.orderId}: Current status is ${v.orderStatus}.`,
      bodyContent: `
        <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Order Progress Update 🔄</h2>
        <p>Dear <strong>${v.customerName}</strong>, your order <strong>#${v.orderId}</strong> has progressed to a new stage:</p>

        <div class="order-box">
          <div class="order-row"><span>Order ID:</span><span>#${v.orderId}</span></div>
          <div class="order-row"><span>New Status:</span><span class="status-badge green">${v.orderStatus}</span></div>
          <div class="order-row"><span>Updated At:</span><span>${new Date().toLocaleString()}</span></div>
          ${v.statusNotes ? `<div class="order-row"><span>Production Notes:</span><span>${v.statusNotes}</span></div>` : ''}
        </div>

        <p>Track the real-time timeline and pickup/delivery logistics on your customer portal.</p>

        <div style="text-align: center;">
          <a href="${v.orderLink || 'http://localhost:5173/orders'}" class="action-btn">View Live Timeline</a>
        </div>
      `,
      variables: v
    })
  },

  QUOTATION_CREATED: {
    subject: 'Your Custom Printing Quotation is Ready: {{quotationAmount}}',
    render: (v) => wrapEmailTemplate({
      title: 'Printing Quotation Ready',
      preheader: `Your customized print quotation for request #${v.requestId || v.orderId} is now available.`,
      bodyContent: `
        <h2 style="font-size: 20px; color: #0284c7; margin-top: 0;">Custom Quotation Ready! 📐</h2>
        <p>Dear <strong>${v.customerName}</strong>, our estimation team has prepared your custom quotation for your printing requirement.</p>

        <div class="order-box">
          <div class="order-row"><span>Quotation Ref:</span><span>#${v.requestId || v.orderId}</span></div>
          <div class="order-row"><span>Service / Specifications:</span><span>${v.serviceName || 'Custom Print Specifications'}</span></div>
          <div class="order-row"><span>Quoted Amount:</span><span style="font-size:18px; color:#0284c7; font-weight:800;">₹${v.quotationAmount}</span></div>
          <div class="order-row"><span>Validity:</span><span>${v.validityDays ? v.validityDays + ' Days' : '7 Days from issue'}</span></div>
          ${v.notes ? `<div class="order-row"><span>Estimator Notes:</span><span>${v.notes}</span></div>` : ''}
        </div>

        <p>You can review and accept this quote directly from your customer account to start printing immediately.</p>

        <div style="text-align: center;">
          <a href="${v.orderLink || 'http://localhost:5173/requests'}" class="action-btn">View & Accept Quotation</a>
        </div>
      `,
      variables: v
    })
  },

  SUPPORT: {
    subject: 'Support Response from Sri Ramu Digital: #{{requestId}}',
    render: (v) => wrapEmailTemplate({
      title: 'Customer Support Response',
      preheader: `Support update regarding ticket #${v.requestId}.`,
      bodyContent: `
        <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Support Desk Response 💬</h2>
        <p>Dear <strong>${v.customerName}</strong>, our team has responded to your inquiry/request <strong>#${v.requestId}</strong>.</p>

        <div class="order-box">
          <div class="order-row"><span>Ticket / Request ID:</span><span>#${v.requestId}</span></div>
          <div class="order-row"><span>Subject / Type:</span><span>${v.requestType || 'Customer Support'}</span></div>
          <div style="margin-top:12px; padding:10px; background:#ffffff; border-radius:6px; border:1px solid #cbd5e1; font-size:14px;">
            <strong>Admin Response:</strong>
            <p style="margin:6px 0 0; color:#334155;">${v.adminResponse || v.message || 'We are looking into your request.'}</p>
          </div>
        </div>

        <div style="text-align: center;">
          <a href="${v.orderLink || 'http://localhost:5173/requests'}" class="action-btn">View Request Conversation</a>
        </div>
      `,
      variables: v
    })
  },

  OFFER: {
    subject: 'Special Offer: {{offerTitle}} — Sri Ramu Digital',
    render: (v) => wrapEmailTemplate({
      title: 'Special Printing Offer',
      preheader: `${v.offerTitle || 'Exclusive printing discounts available at Sri Ramu Digital.'}`,
      bodyContent: `
        <h2 style="font-size: 20px; color: #d97706; margin-top: 0;">🌟 ${v.offerTitle || 'Special Promotional Offer'}</h2>
        <p>Dear <strong>${v.customerName || 'Valued Customer'}</strong>,</p>
        <p>${v.message || 'Take advantage of our exclusive limited-time discounts on bulk flex banners, vinyl prints, and business visiting cards.'}</p>

        ${v.couponCode ? `
        <div style="background:#fef3c7; border:2px dashed #d97706; border-radius:8px; padding:18px; text-align:center; margin:20px 0;">
          <div style="font-size:12px; color:#b45309; text-transform:uppercase; font-weight:700;">Use Coupon Code at Checkout</div>
          <div style="font-size:26px; font-weight:900; color:#b45309; letter-spacing:2px; margin:6px 0;">${v.couponCode}</div>
          <div style="font-size:12px; color:#78350f;">Valid till ${v.expiryDate || 'End of Month'}</div>
        </div>
        ` : ''}

        <div style="text-align: center;">
          <a href="${v.actionUrl || v.clientUrl || 'http://localhost:5173'}" class="action-btn" style="background:#d97706;">Shop Offers Now</a>
        </div>
      `,
      variables: v
    })
  }
};

class BrevoEmailService {
  constructor() {
    this.maxRetries = 3;
  }

  async sendEmail({
    to,
    toName,
    templateType,
    variables = {},
    customSubject = null,
    relatedOrderId = null,
    relatedCustomerId = null,
    retryCount = 0
  }) {
    const config = getBrevoConfig();
    const template = EMAIL_TEMPLATES[templateType] || EMAIL_TEMPLATES.ORDER_STATUS_UPDATED;

    const mergedVariables = {
      customerName: toName || 'Customer',
      customerEmail: to,
      businessName: config.businessName,
      businessPhone: config.businessPhone,
      businessEmail: config.businessEmail,
      businessAddress: config.businessAddress,
      clientUrl: config.clientUrl,
      ...variables
    };

    const subject = customSubject || interpolateTemplate(template.subject, mergedVariables);
    const htmlContent = template.render(mergedVariables);

    // Create initial EmailLog record
    const logDoc = store.create('emailLogs', {
      eventType: templateType,
      recipient: to,
      recipientName: toName || '',
      subject,
      relatedOrderId: relatedOrderId || mergedVariables.orderId || null,
      relatedCustomerId: relatedCustomerId || null,
      provider: 'BREVO',
      providerStatus: 'QUEUED',
      htmlPreview: htmlContent,
      retryCount,
      timestamp: new Date().toISOString()
    });

    // Check if Brevo API Key is configured
    if (!config.apiKey || config.apiKey.trim() === '') {
      console.log(`[BrevoEmailService Mock] API key not configured. Safely simulated transactional email to: ${to} (Subject: ${subject})`);
      store.findByIdAndUpdate('emailLogs', logDoc._id, {
        providerStatus: 'SIMULATED_SUCCESS',
        notes: 'API key not configured in .env - transactional email simulated and logged with full HTML preview.'
      });
      return { success: true, simulated: true, logId: logDoc._id, message: 'Email logged in simulation mode' };
    }

    // Call real Brevo REST API v3
    try {
      const payload = JSON.stringify({
        sender: {
          name: config.senderName,
          email: config.senderEmail
        },
        to: [
          {
            email: to,
            name: toName || to
          }
        ],
        replyTo: {
          email: config.replyToEmail,
          name: config.senderName
        },
        subject,
        htmlContent
      });

      const response = await this.executeBrevoPost(config.apiKey, payload);

      store.findByIdAndUpdate('emailLogs', logDoc._id, {
        providerStatus: 'DELIVERED',
        messageId: response.messageId || 'brevo_' + Date.now(),
        responseDetails: response
      });

      console.log(`[BrevoEmailService] Successfully sent transactional email to ${to} (${subject})`);
      return { success: true, messageId: response.messageId, logId: logDoc._id };
    } catch (error) {
      console.error(`[BrevoEmailService Error] Failed to send email to ${to}:`, error.message);

      store.findByIdAndUpdate('emailLogs', logDoc._id, {
        providerStatus: 'FAILED',
        error: error.message
      });

      // Controlled retry with exponential backoff (up to 3 retries)
      if (retryCount < this.maxRetries) {
        const nextRetry = retryCount + 1;
        const delay = Math.pow(2, nextRetry) * 1000;
        console.log(`[BrevoEmailService] Scheduling retry #${nextRetry} in ${delay}ms...`);
        setTimeout(() => {
          this.sendEmail({
            to,
            toName,
            templateType,
            variables,
            customSubject,
            relatedOrderId,
            relatedCustomerId,
            retryCount: nextRetry
          }).catch(e => console.error('[Brevo Retry Error]', e));
        }, delay);
      }

      return { success: false, error: error.message, logId: logDoc._id };
    }
  }

  executeBrevoPost(apiKey, payload) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.brevo.com',
        port: 443,
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body || '{}'));
            } catch (e) {
              resolve({ status: 'ok', body });
            }
          } else {
            reject(new Error(`Brevo API responded with status ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Brevo API request timed out after 10000ms'));
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(payload);
      req.end();
    });
  }
}

const brevoService = new BrevoEmailService();
module.exports = brevoService;
