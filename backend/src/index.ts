import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { sentimentRouter } from './routes/sentiment.js';
import { settingsRouter } from './routes/settings.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sentiment', sentimentRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
