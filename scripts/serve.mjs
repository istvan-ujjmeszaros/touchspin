import express from 'express';

const app = express();
const root = process.cwd();

app.use(express.static(root, {
  etag: false,
  lastModified: false,
  cacheControl: false,
  maxAge: 0,
}));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Static server running at http://localhost:${port}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

