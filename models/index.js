// models/index.js
const sequelize = require("../config/database"); // correctly import sequelize

const User = require('./User');
const Expense = require('./Expense');
const Order = require('./Order');
const { ForgotPasswordRequest } = require('./ForgotPasswordRequest');

// Define associations
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

module.exports = {
  sequelize, // export sequelize
  User,
  Expense,
  Order,
  ForgotPasswordRequest
};
