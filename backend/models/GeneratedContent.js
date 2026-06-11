const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GeneratedContent = sequelize.define('GeneratedContent', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  channelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'channel_id',
  },
  channelName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'channel_name',
  },
  topic: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  titles: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  hashtags: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  platformPrompts: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'platform_prompts',
  },
  reelScript: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'reel_script',
  },
  videoIdeas: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'video_ideas',
  },
  thumbnailBriefs: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'thumbnail_briefs',
  },
  voiceoverScript: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'voiceover_script',
  },
}, {
  tableName: 'generated_content',
  timestamps: true,
});

module.exports = GeneratedContent;
