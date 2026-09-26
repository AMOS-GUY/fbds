const axios = require('axios');

// Using Infobip WhatsApp API (alternatives: Twilio, Meta Cloud API)
const sendWhatsAppMessage = async (to, message) => {
  try {
    const response = await axios.post(
      'https://<your-base-url>/whatsapp/1/message/template',
      {
        messages: [
          {
            destinations: [{ to: `+${to.replace('+', '')}` }],
            from: process.env.WHATSAPP_FROM_NUMBER,
            templateName: 'order_notification',
            templateData: {
              body: {
                placeholders: [message]
              }
            }
          }
        ]
      },
      {
        headers: {
          'Authorization': `App ${process.env.WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    throw new Error('Failed to send WhatsApp message');
  }
};

const sendOrderNotification = async (adminPhone, order) => {
  const message = `
🛒 *NEW ORDER ALERT* 🛒

📦 Order ID: ${order._id}
👤 Customer: ${order.customerName}
📱 Phone: ${order.customerPhone}
💰 Total: ${order.totalAmount} XOF
📍 Delivery: ${order.deliveryAddress}

📋 Items:
${order.items.map(item => `• ${item.productName} x${item.quantity} - ${item.price * item.quantity} XOF`).join('\n')}

⏰ Placed: ${new Date(order.createdAt).toLocaleString('fr-BF')}

✅ *Action Required*: Please confirm order processing.
  `.trim();
  
  return await sendWhatsAppMessage(adminPhone, message);
};

const sendLoginNotification = async (userPhone, userName) => {
  const message = `
🔐 *Login Alert*

Hello ${userName}! 👋

A new login was detected on your BurkinaChina Connect account.

📍 Location: Burkina Faso
🕐 Time: ${new Date().toLocaleString('fr-BF')}

If this wasn't you, please contact support immediately.

🛡️ Stay safe!
  `.trim();
  
  // Only send to user if they opted in for security alerts
  return await sendWhatsAppMessage(userPhone, message);
};

module.exports = { 
  sendWhatsAppMessage, 
  sendOrderNotification, 
  sendLoginNotification 
};