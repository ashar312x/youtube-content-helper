const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  generateContent,
  generateTitleVariants,
  generateThumbnailBriefs,
  generateVoiceoverScript,
  generateTrendingSuggestions,
} = require('../services/groqService');
const { GeneratedContent, Channel } = require('../models');

const trendingLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });
const batchLimiter = rateLimit({ windowMs: 60 * 1000, max: 1 });

// Generate full content package
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

// Regenerate only the titles for an existing content record
router.post('/regenerate-titles', async (req, res) => {
  try {
    const { contentId, channelName, topic } = req.body;
    if (!channelName) return res.status(400).json({ error: 'channelName is required' });

    const result = await generateTitleVariants(channelName, topic);

    if (contentId) {
      const record = await GeneratedContent.findByPk(contentId);
      if (record) await record.update({ titles: result.titles });
    }

    res.json({ success: true, data: { titles: result.titles, styles: result.styles } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate thumbnail briefs for an existing content record
router.post('/generate-thumbnails', async (req, res) => {
  try {
    const { contentId, titles, channelName } = req.body;
    if (!titles || !channelName) return res.status(400).json({ error: 'titles and channelName required' });

    const result = await generateThumbnailBriefs(titles, channelName);

    if (contentId) {
      const record = await GeneratedContent.findByPk(contentId);
      if (record) await record.update({ thumbnailBriefs: result.briefs });
    }

    res.json({ success: true, data: result.briefs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate voiceover script for an existing content record
router.post('/generate-voiceover', async (req, res) => {
  try {
    const { contentId, channelName, topic, description } = req.body;
    if (!channelName) return res.status(400).json({ error: 'channelName required' });

    const script = await generateVoiceoverScript(channelName, topic, description);

    if (contentId) {
      const record = await GeneratedContent.findByPk(contentId);
      if (record) await record.update({ voiceoverScript: script });
    }

    res.json({ success: true, data: { voiceoverScript: script } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trending topics for a niche
router.get('/trending/:niche', trendingLimiter, async (req, res) => {
  try {
    const { niche } = req.params;
    if (!niche) return res.status(400).json({ error: 'niche is required' });

    const result = await generateTrendingSuggestions(decodeURIComponent(niche));
    res.json({ success: true, data: result.topics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Batch generate content for multiple topics
router.post('/batch-generate', batchLimiter, async (req, res) => {
  try {
    const { channelName, topics } = req.body;
    if (!channelName) return res.status(400).json({ error: 'channelName is required' });
    if (!Array.isArray(topics) || topics.length === 0) return res.status(400).json({ error: 'topics array is required' });
    if (topics.length > 10) return res.status(400).json({ error: 'Maximum 10 topics per batch' });

    const [channel] = await Channel.findOrCreate({
      where: { name: channelName },
      defaults: { name: channelName },
    });

    const results = await Promise.allSettled(
      topics.map(async (topic) => {
        const aiResult = await generateContent(channelName, topic);
        return GeneratedContent.create({
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
      })
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    const failed = results
      .map((r, i) => (r.status === 'rejected' ? { topic: topics[i], error: r.reason.message } : null))
      .filter(Boolean);

    res.json({ success: true, data: { succeeded, failed, total: topics.length } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get content history
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
