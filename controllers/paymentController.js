const axios = require("axios");
const { Order, User } = require("../models");
require("dotenv").config();

// Create Order
exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;
        const orderId = `order_${Date.now()}`;

        // Check if user is already premium
        const user = await User.findByPk(userId);
        if (user.isPremium) {
            return res.status(400).json({ 
                message: "You are already a premium user",
                isPremium: true
            });
        }

        // Create order in database
        await Order.create({ 
            id: orderId, 
            UserId: userId, 
            amount 
        });

        // Create order in Cashfree
        const response = await axios.post(
            "https://sandbox.cashfree.com/pg/orders",
            {
                order_id: orderId,
                order_amount: amount,
                order_currency: "INR",
                customer_details: {
                    customer_id: String(userId),
                    customer_email: user.email || "test@example.com",
                    customer_phone: "9999999999"
                },
                order_meta: {
                    return_url: `${process.env.FRONTEND_URL}/payment-status.html?order_id=${orderId}`,
                    payment_methods: "cc,upi,nb"
                }
            },
            {
                headers: {
                    "x-client-id": process.env.CASHFREE_APP_ID,
                    "x-client-secret": process.env.CASHFREE_SECRET_KEY,
                    "x-api-version": "2022-09-01",
                    "content-type": "application/json"
                }
            }
        );

        res.json({ 
            paymentSessionId: response.data.payment_session_id, 
            orderId 
        });
    } catch (error) {
        console.error("Cashfree API Error:", error.response?.data || error.message);
        res.status(500).json({ message: "Payment initiation failed." });
    }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = orderStatus;
        await order.save();

        // If status is PAID, update user to premium
        if (orderStatus === 'PAID' || orderStatus === 'SUCCESSFUL') {
            const user = await User.findByPk(order.UserId);
            if (user) {
                user.isPremium = true;
                await user.save();
            }
        }

        res.json({ 
            message: `Order updated to ${orderStatus}`,
            isPremium: orderStatus === 'PAID' || orderStatus === 'SUCCESSFUL'
        });
    } catch (error) {
        console.error("Update Order Status Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get Payment Status
exports.getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        // First check if we already have the status in our database
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ 
                message: 'Order not found in DB',
                orderStatus: 'failed'
            });
        }

        // If order is already marked as paid in our database
        if (order.status === 'PAID' || order.status === 'SUCCESS' || order.status === 'SUCCESSFUL') {
            return res.json({
                orderStatus: order.status,
                message: `Order found with status ${order.status}`
            });
        }

        // Otherwise check with Cashfree
        try {
            const response = await axios.get(
                `https://sandbox.cashfree.com/pg/orders/${orderId}`, 
                {
                    headers: {
                        "x-client-id": process.env.CASHFREE_APP_ID,
                        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
                        "x-api-version": "2022-09-01",
                    }
                }
            );

            const cashfreeStatus = response.data.order_status.toLowerCase();

            // Update order status in DB
            order.status = cashfreeStatus;
            await order.save();

            // If paid, update the user to premium
            if (cashfreeStatus === 'paid' || cashfreeStatus === 'success' || cashfreeStatus === 'successful') {
                const user = await User.findByPk(order.UserId);
                if (user) {
                    user.isPremium = true;
                    await user.save();
                }
            }

            return res.json({
                orderStatus: cashfreeStatus,
                message: `Order found with status ${cashfreeStatus.toUpperCase()}`
            });
        } catch (cashfreeError) {
            console.error("Error fetching status from Cashfree:", cashfreeError?.response?.data || cashfreeError.message);
            
            // If we can't reach Cashfree, use our local status
            return res.json({
                orderStatus: order.status,
                message: `Using local order status: ${order.status.toUpperCase()}`
            });
        }
    } catch (error) {
        console.error("Payment Status Error:", error);
        return res.status(500).json({ 
            orderStatus: 'failed', 
            message: 'Could not fetch payment status' 
        });
    }
};