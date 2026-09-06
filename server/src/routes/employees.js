import path from 'node:path';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { all, one, q } from '../db.js';
import { requireRole } from '../auth.js';
import { UPLOAD_DIR } from '../config.js';
import { normPhone } from './auth.js';

const fields = `id, phone, last_name, first_name, middle_name, birth_date,
                photo_path, role, status, note, created_at`;

export default async function routes(app) {
  app.addHook('preHandler', app.authenticate);

  // Список сотрудников. Комплектовщику он не нужен и не отдаётся.
  app.get('/', { preHandler: [requireRole('senior')] }, async (req) => {
    const { status } = req.query;
    return all(
      `SELECT ${fields} FROM employees
       WHERE ($1::text IS NULL OR status = $1)
       ORDER BY status = 'pending' DESC, last_name, first_name`,
      [status || null],
    );
  });

  app.get('/me', async (req) => req.emp);

  app.patch('/me', async (req, reply) => {
    const b = req.body || {};
    if (b.last_name !== undefined && !String(b.last_name).trim()) {
      return reply.code(400).send({ error: 'Фамилия не может быть пустой' });
    }

    // Телефон — это логин, поэтому он должен остаться уникальным.
    let phone = null;
    if (b.phone !== undefined && b.phone !== null && String(b.phone).trim() !== '') {
      phone = normPhone(b.phone);
      if (phone.length !== 11) {
        return reply.code(400).send({ error: 'Укажите телефон в формате +7 999 123-45-67' });
      }
      const taken = await one('SELECT id FROM employees WHERE phone = $1 AND id <> $2',
        [phone, req.emp.id]);
      if (taken) return reply.code(409).send({ error: 'Этот телефон уже занят другим сотрудником' });
    }

    return one(
      `UPDATE employees SET
         last_name   = COALESCE($2, last_name),
         first_name  = COALESCE($3, first_name),
         middle_name = COALESCE($4, middle_name),
         birth_date  = COALESCE($5, birth_date),
         phone       = COALESCE($6, phone)
       WHERE id = $1 RETURNING ${fields}`,
      [req.emp.id, b.last_name?.trim(), b.first_name?.trim(),
       b.middle_name?.trim(), b.birth_date || null, phone],
    );
  });

  app.post('/me/photo', async (req, reply) => {
    const file = await req.file();
    if (!file) return reply.code(400).send({ error: 'Файл не получен' });
    if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
      return reply.code(400).send({ error: 'Фото должно быть JPG, PNG или WEBP' });
    }
    const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[file.mimetype];
    const name = `${randomUUID()}${ext}`;
    await pipeline(file.file, createWriteStream(path.join(UPLOAD_DIR, name)));
    if (file.file.truncated) {
      await fs.unlink(path.join(UPLOAD_DIR, name)).catch(() => {});
      return reply.code(413).send({ error: 'Файл больше 8 МБ' });
    }
    const prev = req.emp.photo_path;
    const emp = await one(
      `UPDATE employees SET photo_path = $2 WHERE id = $1 RETURNING ${fields}`,
      [req.emp.id, `/uploads/${name}`],
    );
    if (prev) await fs.unlink(path.join(UPLOAD_DIR, path.basename(prev))).catch(() => {});
    return emp;
  });

  // Подтверждение заявки на регистрацию и смена роли — только руководитель.
  app.patch('/:id', { preHandler: [requireRole('admin')] }, async (req, reply) => {
    const { role, status, note } = req.body || {};
    if (role && !['admin', 'senior', 'picker'].includes(role)) {
      return reply.code(400).send({ error: 'Неизвестная роль' });
    }
    if (status && !['pending', 'active', 'blocked'].includes(status)) {
      return reply.code(400).send({ error: 'Неизвестный статус' });
    }
    if (req.params.id === req.emp.id && (status === 'blocked' || (role && role !== 'admin'))) {
      return reply.code(400).send({ error: 'Нельзя понизить или заблокировать самого себя' });
    }
    const emp = await one(
      `UPDATE employees SET role = COALESCE($2, role), status = COALESCE($3, status),
                            note = COALESCE($4, note)
       WHERE id = $1 RETURNING ${fields}`,
      [req.params.id, role || null, status || null, note ?? null],
    );
    if (!emp) return reply.code(404).send({ error: 'Сотрудник не найден' });
    return emp;
  });

  // Полное удаление вместе со сменами, выработкой, выплатами и штрафами.
  // Обычно достаточно заблокировать — тогда история расчётов остаётся.
  app.delete('/:id', { preHandler: [requireRole('admin')] }, async (req, reply) => {
    if (req.params.id === req.emp.id) {
      return reply.code(400).send({ error: 'Нельзя удалить самого себя' });
    }
    const emp = await one('SELECT id, role FROM employees WHERE id = $1', [req.params.id]);
    if (!emp) return reply.code(404).send({ error: 'Сотрудник не найден' });

    // последний руководитель должен остаться, иначе в систему будет не войти
    if (emp.role === 'admin') {
      const others = await one(
        `SELECT count(*)::int AS n FROM employees
         WHERE role = 'admin' AND status = 'active' AND id <> $1`, [req.params.id]);
      if (!others.n) {
        return reply.code(400).send({ error: 'Это последний руководитель — удалять нельзя' });
      }
    }

    await q('DELETE FROM employees WHERE id = $1', [req.params.id]);
    return { ok: true };
  });

  // Персональная ставка: перебивает типовую по роли.
  app.get('/:id/rates', { preHandler: [requireRole('admin')] }, async (req) =>
    all(`SELECT id, kind, amount, effective_from FROM employee_rates
         WHERE employee_id = $1 ORDER BY effective_from DESC`, [req.params.id]));

  app.post('/:id/rates', { preHandler: [requireRole('admin')] }, async (req, reply) => {
    const { kind, amount, effective_from } = req.body || {};
    if (!['day', 'night'].includes(kind)) {
      return reply.code(400).send({ error: 'Вид смены: day или night' });
    }
    if (!(Number(amount) >= 0)) return reply.code(400).send({ error: 'Некорректная сумма' });
    return one(
      `INSERT INTO employee_rates (employee_id, kind, amount, effective_from)
       VALUES ($1, $2, $3, COALESCE($4, current_date))
       ON CONFLICT (employee_id, kind, effective_from) DO UPDATE SET amount = EXCLUDED.amount
       RETURNING id, kind, amount, effective_from`,
      [req.params.id, kind, amount, effective_from || null],
    );
  });

  app.delete('/:id/rates/:rateId', { preHandler: [requireRole('admin')] }, async (req) => {
    await one('DELETE FROM employee_rates WHERE id = $1 AND employee_id = $2 RETURNING id',
      [req.params.rateId, req.params.id]);
    return { ok: true };
  });
}
