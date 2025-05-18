const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const ForgotPasswordRequest = sequelize.define('ForgotPasswordRequest', {
  id: {
    type: DataTypes.STRING(36), // Ensure enough length for UUID
    primaryKey: true,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
});

User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User);

module.exports = { ForgotPasswordRequest };