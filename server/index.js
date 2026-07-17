const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const { loadFromMarkdown } = require('./load-from-markdown');

const app = express();
const PORT = process.env.PORT || 3001;

// Check DATABASE_URL in production
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from client build
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ Task Manager Server running at http://localhost:${PORT}\n`);

  // 마크다운 파일에서 데이터 로드
  setTimeout(() => {
    loadFromMarkdown();
  }, 1000);
});
