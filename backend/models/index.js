const sequelize = require('../config/database');
const Channel = require('./Channel');
const GeneratedContent = require('./GeneratedContent');
const EmailAlert = require('./EmailAlert');
const VideoIdea = require('./VideoIdea');

Channel.hasMany(GeneratedContent, { foreignKey: 'channel_id', as: 'contents' });
GeneratedContent.belongsTo(Channel, { foreignKey: 'channel_id', as: 'channel' });

module.exports = { sequelize, Channel, GeneratedContent, EmailAlert, VideoIdea };
