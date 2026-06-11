const express = require('express');
const router = express.Router();
const { Channel, GeneratedContent } = require('../models');

router.get('/', async (req, res) => {
  try {
    const channels = await Channel.findAll({ order: [['updatedAt', 'DESC']] });
    res.json({ success: true, data: channels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, niche, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const [channel, created] = await Channel.findOrCreate({
      where: { name },
      defaults: { name, niche, description },
    });

    if (!created && (niche || description)) {
      await channel.update({ niche, description });
    }

    res.json({ success: true, data: channel, created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const channel = await Channel.findByPk(req.params.id, {
      include: [{ model: GeneratedContent, as: 'contents', limit: 5, order: [['createdAt', 'DESC']] }],
    });
    if (!channel) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: channel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const channel = await Channel.findByPk(req.params.id);
    if (!channel) return res.status(404).json({ error: 'Not found' });
    await channel.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
