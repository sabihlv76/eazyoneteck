import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const port = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnvFile(fileName) {
  const fullPath = path.join(rootDir, fileName);

  if (!fs.existsSync(fullPath)) {
    return;
  }

  const envText = fs.readFileSync(fullPath, 'utf8');

  for (const line of envText.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) {
      continue;
    }

    const idx = line.indexOf('=');
    if (idx === -1) {
      continue;
    }

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function wrapHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

async function start() {
  loadEnvFile('.env');
  loadEnvFile('.env.local');

  const [
    { default: authAccountHandler },
    { default: authSignInHandler },
    { default: authSignOutHandler },
    { default: authSignUpHandler },
    { default: adminLoginHandler },
    { default: adminLogoutHandler },
    { default: productByIdHandler },
    { default: productsHandler },
    { default: productsResetHandler },
    { default: settingsHandler },
  ] = await Promise.all([
    import('../api/auth/account.js'),
    import('../api/auth/signin.js'),
    import('../api/auth/signout.js'),
    import('../api/auth/signup.js'),
    import('../api/admin/login.js'),
    import('../api/admin/logout.js'),
    import('../api/products/[id].js'),
    import('../api/products/index.js'),
    import('../api/products/reset.js'),
    import('../api/settings.js'),
  ]);

  const app = express();
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
    },
    appType: 'spa',
  });

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  app.get('/api/products', wrapHandler(productsHandler));
  app.post('/api/products', wrapHandler(productsHandler));
  app.post('/api/products/reset', wrapHandler(productsResetHandler));
  app.put('/api/products/:id', wrapHandler(productByIdHandler));
  app.delete('/api/products/:id', wrapHandler(productByIdHandler));

  app.get('/api/settings', wrapHandler(settingsHandler));
  app.put('/api/settings', wrapHandler(settingsHandler));

  app.post('/api/auth/signup', wrapHandler(authSignUpHandler));
  app.post('/api/auth/signin', wrapHandler(authSignInHandler));
  app.get('/api/auth/account', wrapHandler(authAccountHandler));
  app.put('/api/auth/account', wrapHandler(authAccountHandler));
  app.post('/api/auth/signout', wrapHandler(authSignOutHandler));

  app.post('/api/admin/login', wrapHandler(adminLoginHandler));
  app.post('/api/admin/logout', wrapHandler(adminLogoutHandler));

  app.use(vite.middlewares);

  app.use((error, _req, res, next) => {
    void next;
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error.message || 'Internal server error.',
      });
    }
  });

  app.listen(port, () => {
    console.log(`Fullstack dev server running at http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
