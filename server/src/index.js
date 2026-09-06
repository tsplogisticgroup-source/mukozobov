import 'dotenv/config';
import fs from 'node:fs/promises';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fstatic from '@fastify/static';

import { UPLOAD_DIR } from './config.js';
import { one, q } from './db.js';
import { hash, authenticate } from './auth.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import shiftRoutes from './routes/shifts.js';
import outputRoutes from './routes/outputs.js';
import rateRoutes from './routes/rates.js';
import reportRoutes from './routes/reports.js';
import paymentRoutes from './routes/payments.js';

const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

await app.register(cors, { origin: true, credentials: true });
await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'dev-secret-change-me',
  sign: { expiresIn: '30d' },
});
await app.register(multipart, { limits: { fileSize: 8 * 1024 * 1024 } });

await fs.mkdir(UPLOAD_DIR, { recursive: true });
await app.register(fstatic, { root: UPLOAD_DIR, prefix: '/uploads/' });

app.decorate('authenticate', authenticate);

app.get('/api/health', async () => ({ ok: true }));

await app.register(authRoutes,      { prefix: '/api/auth' });
await app.register(employeeRoutes,  { prefix: '/api/employees' });
await app.register(shiftRoutes,     { prefix: '/api/shifts' });
await app.register(outputRoutes,    { prefix: '/api/outputs' });
await app.register(rateRoutes,      { prefix: '/api/rates' });
await app.register(reportRoutes,    { prefix: '/api/reports' });
await app.register(paymentRoutes,   { prefix: '/api/payments' });

// Первый запуск: если админов нет — заводим по данным из .env,
// иначе в систему было бы некому войти и некому подтверждать заявки.
async function ensureAdmin() {
  const exists = await one(`SELECT id FROM employees WHERE role = 'admin' LIMIT 1`);
  if (exists) return;
  const phone = process.env.ADMIN_PHONE;
  const password = process.env.ADMIN_PASSWORD;
  if (!phone || !password) {
    app.log.warn('Админ не создан: задайте ADMIN_PHONE и ADMIN_PASSWORD в .env');
    return;
  }
  await q(
    `INSERT INTO employees (phone, password_hash, last_name, first_name, role, status)
     VALUES ($1, $2, $3, $4, 'admin', 'active')
     ON CONFLICT (phone) DO NOTHING`,
    [phone, await hash(password), process.env.ADMIN_LAST_NAME || 'Руководитель',
     process.env.ADMIN_FIRST_NAME || 'Склада'],
  );
  app.log.info(`Создан руководитель склада: ${phone}`);
}

// Ждём postgres: контейнер БД может подниматься дольше, чем API.
async function waitForDb(retries = 30) {
  for (let i = 1; i <= retries; i++) {
    try {
      await q('SELECT 1');
      return;
    } catch (err) {
      app.log.warn(`БД недоступна (попытка ${i}/${retries}): ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error('Не удалось подключиться к базе данных');
}

await waitForDb();
await ensureAdmin();

const port = Number(process.env.PORT || 3000);
await app.listen({ port, host: '0.0.0.0' });
