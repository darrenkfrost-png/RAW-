import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from "vite";

const resolvedFilename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const resolvedDirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(resolvedFilename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Real-time API health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: Date.now(), version: "4.0.0", platform: "RAW_INTEGRATED_SYSTEM" });
  });


  app.post("/api/debug-crash", (req, res) => {
    try {
      fs.writeFileSync('crash.log', JSON.stringify(req.body, null, 2));
      console.log('CRASH LOG WRITTEN TO crash.log');
    } catch (e) {
      console.error(e);
    }
    res.json({ ok: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Resolve from the project root, never relative to this bundle. The
    // bundle has moved once already (dist/ -> server-dist/), and each move
    // silently changed where the site was served from: the previous version
    // resolved to <root>/dist/dist and answered every page with a bare 404
    // while /api/health still reported healthy.
    const CLIENT_DIST = path.join(process.cwd(), 'dist');
    app.use(express.static(CLIENT_DIST));
    app.get('*', (req, res) => {
      res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();