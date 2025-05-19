const axios = require('axios');

class PaymentService {
  constructor() {
    this.baseURL = 'https://sandbox.cashfree.com/pg';
    this.headers = {
      'x-client-id': process.env.CASHFREE_APP_ID,
      'x-client-secret': process.env.CASHFREE_SECRET_KEY,
      'x-api-version': '2025-01-01'
    };
  }

  async createOrder(orderData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/orders`,
        orderData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Create order error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getPaymentStatus(orderId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/orders/${orderId}/payments`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      console.error('Get payment status error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new PaymentService();