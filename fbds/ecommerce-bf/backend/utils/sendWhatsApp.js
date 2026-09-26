const axios = require('axios');

const sendWhatsAppOrderNotification = async (order) => {
  const message = `📦 NEW ORDER\nID: ${order._id}\nTotal: ${order.total} XOF\nMethod: ${order.paymentMethod}\nPhone: ${order.phone}\nAddress: ${order.shippingAddress}\nItems: ${order.items.map(i => `${i.product.name} x${i.quantity}`).join(', ')}`;

  try {
    await axios.post(process.env.WHATSAPP_API_URL, {
      messaging_product: "whatsapp",
      to: process.env.ADMIN_WHATSAPP_NUMBER,
      text: { body: message }
    }, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
    });
  } catch (err) {
    console.error('WhatsApp notification failed:', err.response?.data || err.message);
  }
};

module.exports = { sendWhatsAppOrderNotification };