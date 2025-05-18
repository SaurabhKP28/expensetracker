const express = require("express");
const router = express.Router();
const { Expense, User, sequelize } = require("../models");
const authenticateToken = require("../middleware/auth");
const premiumController = require('../controllers/premiumController');


// Add an expense (with transaction)
router.post("/", authenticateToken, async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { amount, category, description, frequency } = req.body;

        if (!amount || !category) {
            await t.rollback();
            return res.status(400).json({ error: "Amount and category are required" });
        }

        const expense = await Expense.create({
            UserId: req.user.id,
            amount,
            category,
            description,
            frequency
        }, { transaction: t });

        const user = await User.findByPk(req.user.id, { transaction: t });

        const updatedTotal = parseFloat(user.totalExpense || 0) + parseFloat(amount);

        await User.update(
            { totalExpense: updatedTotal },
            { where: { id: req.user.id }, transaction: t }
        );

        await t.commit();
        res.status(201).json(expense);
    } catch (error) {
        await t.rollback();
        console.error("Error adding expense:", error);
        res.status(500).json({ error: "Failed to add expense" });
    }
});

// Fetch all expenses with pagination
router.get("/", authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Expense.findAndCountAll({
            where: { UserId: req.user.id },
            order: [["createdAt", "DESC"]],
            limit,
            offset
        });

        res.json({
            expenses: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
});

// Update an expense
router.put("/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { amount, category, description, frequency } = req.body;

    const t = await sequelize.transaction();
    try {
        const expense = await Expense.findOne({
            where: { id, UserId: req.user.id },
            transaction: t
        });

        if (!expense) {
            await t.rollback();
            return res.status(404).json({ message: 'Expense not found or unauthorized' });
        }

        const oldAmount = parseFloat(expense.amount);
        const newAmount = parseFloat(amount);
        const difference = newAmount - oldAmount;

        expense.amount = newAmount;
        expense.category = category;
        expense.description = description;
        expense.frequency = frequency;

        await expense.save({ transaction: t });

        if (difference !== 0) {
            const user = await User.findByPk(req.user.id, { transaction: t });
            const updatedTotal = parseFloat(user.totalExpense || 0) + difference;

            await User.update(
                { totalExpense: updatedTotal },
                { where: { id: req.user.id }, transaction: t }
            );
        }

        await t.commit();
        res.status(200).json(expense);
    } catch (error) {
        await t.rollback();
        console.error("Error updating expense:", error);
        res.status(500).json({ error: "Failed to update expense" });
    }
});

// Delete an expense
router.delete("/:id", authenticateToken, async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const expense = await Expense.findOne({
            where: { id: req.params.id, UserId: req.user.id },
            transaction: t
        });

        if (!expense) {
            await t.rollback();
            return res.status(404).json({ error: "Expense not found" });
        }

        const user = await User.findByPk(req.user.id, { transaction: t });
        const updatedTotal = parseFloat(user.totalExpense || 0) - parseFloat(expense.amount);

        await User.update(
            { totalExpense: updatedTotal },
            { where: { id: req.user.id }, transaction: t }
        );

        await expense.destroy({ transaction: t });

        await t.commit();
        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        await t.rollback();
        console.error("Error deleting expense:", error);
        res.status(500).json({ error: "Failed to delete expense" });
    }
});

// Generate report - Premium feature
router.get('/report/:timeframe', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.isPremium) {
            return res.status(403).json({ 
                error: "Premium feature. Please upgrade to access reports." 
            });
        }

        req.query.timeframe = req.params.timeframe;
        await premiumController.generateReport(req, res);
        
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({ error: "Failed to generate report" });
    }
});


module.exports = router;
