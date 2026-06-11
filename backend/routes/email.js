const express = require('express');
const router = express.Router();
const { EmailAlert, VideoIdea } = require('../models');
const { sendVideoAlert, sendTestEmail } = require('../services/emailService');

// Create / update alert subscription
router.post('/subscribe', async (req, res) => {
  try {
    const { email, channelName, frequency = 'daily', alertType = 'all' } = req.body;
    if (!email || !channelName) return res.status(400).json({ error: 'email and channelName required' });

    const [alert, created] = await EmailAlert.findOrCreate({
      where: { email, channelName },
      defaults: { email, channelName, frequency, alertType, isActive: true },
    });

    if (!created) {
      await alert.update({ frequency, alertType, isActive: true });
    }

    res.json({ success: true, data: alert, created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send test email
router.post('/test', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    await sendTestEmail(email);
    res.json({ success: true, message: 'Test email sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger immediate alert for a channel
router.post('/send-now', async (req, res) => {
  try {
    const { channelName, content } = req.body;
    if (!channelName) return res.status(400).json({ error: 'channelName required' });

    const alerts = await EmailAlert.findAll({
      where: { channelName, isActive: true },
    });

    if (alerts.length === 0) return res.status(404).json({ error: 'No active alerts for this channel' });

    const ideas = await VideoIdea.findAll({
      where: { channelName },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    const sendPromises = alerts.map(async (alert) => {
      await sendVideoAlert(alert.email, channelName, ideas, content);
      await alert.update({ lastSentAt: new Date() });
    });

    await Promise.all(sendPromises);
    res.json({ success: true, message: `Alerts sent to ${alerts.length} subscriber(s)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all subscriptions for a channel
router.get('/subscriptions/:channelName', async (req, res) => {
  try {
    const alerts = await EmailAlert.findAll({
      where: { channelName: req.params.channelName },
    });
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deactivate subscription
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const alert = await EmailAlert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Not found' });
    await alert.update({ isActive: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reactivate subscription
router.patch('/:id/activate', async (req, res) => {
  try {
    const alert = await EmailAlert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Not found' });
    await alert.update({ isActive: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
