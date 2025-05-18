const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING
  },
  frequency: {
    type: DataTypes.STRING,
    defaultValue: 'one-time'
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Expense;