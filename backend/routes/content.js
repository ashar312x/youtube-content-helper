const express = require('express');
const router = express.Router();
const { generateContent } = require('../services/groqService');
const { GeneratedContent, Channel } = require('../models');

// Generate full content package for a channel
router.post('/generate', async (req, res) => {
  try {
    const { channelName, topic } = req.body;
    if (!channelName) return res.status(400).json({ error: 'channelName is required' });

    const [channel] = await Channel.findOrCreate({
      where: { name: channelName },
      defaults: { name: channelName },
    });

    const aiResult = await generateContent(channelName, topic);

    const saved = await GeneratedContent.create({
      channelId: channel.id,
      channelName,
      topic: topic || null,
      titles: aiResult.titles,
      description: aiResult.description,
      hashtags: aiResult.hashtags,
      platformPrompts: aiResult.platformPrompts,
      reelScript: aiResult.reelScript,
      videoIdeas: aiResult.videoIdeas,
    });

    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('Generate content error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get content history for a channel
router.get('/history/:channelName', async (req, res) => {
  try {
    const { channelName } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const records = await GeneratedContent.findAndCountAll({
      where: { channelName },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single content record
router.get('/:id', async (req, res) => {
  try {
    const record = await GeneratedContent.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete content record
router.delete('/:id', async (req, res) => {
  try {
    const record = await GeneratedContent.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    await record.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
