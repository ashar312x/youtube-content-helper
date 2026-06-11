const express = require('express');
const router = express.Router();
const { generateVideoIdeas } = require('../services/groqService');
const { VideoIdea } = require('../models');

// Generate new video ideas
router.post('/generate', async (req, res) => {
  try {
    const { channelName, count = 10 } = req.body;
    if (!channelName) return res.status(400).json({ error: 'channelName is required' });

    const result = await generateVideoIdeas(channelName, count);
    const ideas = result.ideas || [];

    const saved = await VideoIdea.bulkCreate(
      ideas.map((idea) => ({
        channelName,
        title: idea.title,
        concept: idea.concept,
        estimatedViews: idea.estimatedViews,
        difficulty: ['easy', 'medium', 'hard'].includes(idea.difficulty) ? idea.difficulty : 'medium',
        platform: idea.platform || 'YouTube',
      }))
    );

    res.json({ success: true, data: saved });
  } catch (err) {
    console.error('Generate ideas error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all ideas for a channel
router.get('/:channelName', async (req, res) => {
  try {
    const { channelName } = req.params;
    const { status } = req.query;

    const where = { channelName };
    if (status) where.status = status;

    const ideas = await VideoIdea.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: ideas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update idea status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const idea = await VideoIdea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ error: 'Not found' });

    await idea.update({ status });
    res.json({ success: true, data: idea });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete idea
router.delete('/:id', async (req, res) => {
  try {
    const idea = await VideoIdea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ error: 'Not found' });
    await idea.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
