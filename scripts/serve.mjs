import express from 'express';
import { createServer } from 'http';

const app = express();
const root = process.cwd();
const port = 8866; // Always use port 8866 as per convention

app.use(express.static(root, {
  etag: false,
  lastModified: false,
  cacheControl: false,
  maxAge: 0,
}));

// Check if port is already in use
const checkPort = () => {
  return new Promise((resolve) => {
    const tester = createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false); // Port is in use
        } else {
          resolve(false); // Other error, assume not safe to start
        }
      })
      .once('listening', () => {
        tester.close();
        resolve(true); // Port is available
      })
      .listen(port);
  });
};

const startServer = async () => {
  const portAvailable = await checkPort();

  if (!portAvailable) {
    console.log(`Server already running on port ${port} - using existing server`);
    process.exit(0);
  }

  const server = app.listen(port, () => {
    console.log(`Static server running at http://localhost:${port}`);
  });

  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

