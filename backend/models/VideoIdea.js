const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VideoIdea = sequelize.define('VideoIdea', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  channelName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'channel_name',
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  concept: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estimatedViews: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'estimated_views',
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('idea', 'scripting', 'filming', 'editing', 'published'),
    defaultValue: 'idea',
  },
  platform: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'video_ideas',
  timestamps: true,
});

module.exports = VideoIdea;
