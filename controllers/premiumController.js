const { User, Expense } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');
const os = require('os');


// Get leaderboard (users with highest total expenses)
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.findAll({
      attributes: ['id', 'name', 'totalExpense'],
      order: [['totalExpense', 'DESC']],
      limit: 10
    });
    
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
};


// Generate detailed expense report
exports.generateReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe } = req.query; // daily, weekly, monthly
    
    let dateCondition = {};
    const now = new Date();
    
    if (timeframe === 'daily') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateCondition = {
        createdAt: {
          [Op.gte]: today
        }
      };
    } else if (timeframe === 'weekly') {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      dateCondition = {
        createdAt: {
          [Op.gte]: lastWeek
        }
      };
    } else if (timeframe === 'monthly') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      dateCondition = {
        createdAt: {
          [Op.gte]: lastMonth
        }
      };
    }
    
    // Get detailed expenses
    const expenses = await Expense.findAll({
      where: {
        UserId: userId,
        ...dateCondition
      },
      order: [['createdAt', 'DESC']]
    });
    
    // Get category totals
    const categoryTotals = await Expense.findAll({
      attributes: [
        'category',
        [sequelize.fn('sum', sequelize.col('amount')), 'total']
      ],
      where: {
        UserId: userId,
        ...dateCondition
      },
      group: ['category']
    });
    
    // Get total amount
    const totalAmount = await Expense.sum('amount', {
      where: {
        UserId: userId,
        ...dateCondition
      }
    });
    
    res.status(200).json({
      expenses,
      categoryTotals,
      totalAmount,
      timeframe
    });
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};



