const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailAlert = sequelize.define('EmailAlert', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { isEmail: true },
  },
  channelName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'channel_name',
  },
  frequency: {
    type: DataTypes.ENUM('daily', 'weekly', 'immediate'),
    allowNull: false,
    defaultValue: 'daily',
  },
  alertType: {
    type: DataTypes.ENUM('video_idea', 'content_ready', 'upload_reminder', 'all'),
    allowNull: false,
    defaultValue: 'all',
    field: 'alert_type',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  lastSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_sent_at',
  },
}, {
  tableName: 'email_alerts',
  timestamps: true,
});

module.exports = EmailAlert;
