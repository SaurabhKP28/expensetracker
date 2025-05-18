const express = require("express");
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const authenticateToken = require("../middleware/auth");
const { User } = require("../models");

// Leaderboard route - Premium feature
router.get("/", authenticateToken, async (req, res) => {
    try {
        // Check if user is premium
        const user = await User.findByPk(req.user.id);
        if (!user.isPremium) {
            return res.status(403).json({ 
                error: "Premium feature. Please upgrade to access leaderboard." 
            });
        }
        
        // Forward to premium controller
        await premiumController.getLeaderboard(req, res);
    } catch (error) {
        console.error("Error accessing leaderboard:", error);
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

module.exports = router;