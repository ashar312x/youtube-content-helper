require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const { sequelize, EmailAlert, VideoIdea } = require('./models');
const { sendVideoAlert } = require('./services/emailService');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
app.use('/api/content/generate', limiter);

app.use('/api/channels', require('./routes/channels'));
app.use('/api/content', require('./routes/content'));
app.use('/api/ideas', require('./routes/ideas'));
app.use('/api/email', require('./routes/email'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use(errorHandler);

// Daily cron job: send scheduled email alerts at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('[CRON] Running daily email alerts...');
  try {
    const alerts = await EmailAlert.findAll({
      where: { isActive: true, frequency: 'daily' },
    });

    for (const alert of alerts) {
      const ideas = await VideoIdea.findAll({
        where: { channelName: alert.channelName },
        order: [['createdAt', 'DESC']],
        limit: 5,
      });

      if (ideas.length > 0) {
        await sendVideoAlert(alert.email, alert.channelName, ideas);
        await alert.update({ lastSentAt: new Date() });
        console.log(`[CRON] Alert sent to ${alert.email} for ${alert.channelName}`);
      }
    }
  } catch (err) {
    console.error('[CRON] Error:', err.message);
  }
});

// Weekly cron job: Mondays at 8 AM
cron.schedule('0 8 * * 1', async () => {
  console.log('[CRON] Running weekly email alerts...');
  try {
    const alerts = await EmailAlert.findAll({
      where: { isActive: true, frequency: 'weekly' },
    });

    for (const alert of alerts) {
      const ideas = await VideoIdea.findAll({
        where: { channelName: alert.channelName },
        order: [['createdAt', 'DESC']],
        limit: 10,
      });

      if (ideas.length > 0) {
        await sendVideoAlert(alert.email, alert.channelName, ideas);
        await alert.update({ lastSentAt: new Date() });
      }
    }
  } catch (err) {
    console.error('[CRON] Weekly error:', err.message);
  }
});

async function start() {
  await sequelize.sync({ alter: true });
  console.log('Database synced');

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);
