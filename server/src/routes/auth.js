import { one } from '../db.js';
import { hash, verify } from '../auth.js';

// Телефон — логин, поэтому храним в одном формате: 79991234567
export function normPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) return '7' + digits.slice(1);
  if (digits.length === 10) return '7' + digits;
  return digits;
}

const publicFields = `id, phone, last_name, first_name, middle_name, birth_date,
                      photo_path, role, status`;

export default async function routes(app) {
  app.post('/register', async (req, reply) => {
    const b = req.body || {};
    const phone = normPhone(b.phone);
    if (phone.length !== 11) {
      return reply.code(400).send({ error: 'Укажите телефон в формате +7 999 123-45-67' });
    }
    if (!b.password || String(b.password).length < 6) {
      return reply.code(400).send({ error: 'Пароль не короче 6 символов' });
    }
    if (!b.last_name?.trim() || !b.first_name?.trim()) {
      return reply.code(400).send({ error: 'Укажите фамилию и имя' });
    }
    const taken = await one('SELECT id FROM employees WHERE phone = $1', [phone]);
    if (taken) return reply.code(409).send({ error: 'Такой телефон уже зарегистрирован' });

    const emp = await one(
      `INSERT INTO employees (phone, password_hash, last_name, first_name, middle_name, birth_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${publicFields}`,
      [phone, await hash(b.password), b.last_name.trim(), b.first_name.trim(),
       b.middle_name?.trim() || null, b.birth_date || null],
    );
    // Токен выдаём сразу: человек сможет зайти и увидеть «заявка на рассмотрении».
    return { token: app.jwt.sign({ sub: emp.id }), employee: emp };
  });

  app.post('/login', async (req, reply) => {
    const phone = normPhone(req.body?.phone);
    const emp = await one(
      `SELECT ${publicFields}, password_hash FROM employees WHERE phone = $1`, [phone],
    );
    if (!emp || !(await verify(String(req.body?.password || ''), emp.password_hash))) {
      return reply.code(401).send({ error: 'Неверный телефон или пароль' });
    }
    if (emp.status === 'blocked') return reply.code(403).send({ error: 'Доступ закрыт' });
    delete emp.password_hash;
    return { token: app.jwt.sign({ sub: emp.id }), employee: emp };
  });

  // Отдельно от authenticate: pending-сотруднику тоже надо увидеть свой статус.
  app.get('/me', async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'Нужен вход в систему' });
    }
    const emp = await one(`SELECT ${publicFields} FROM employees WHERE id = $1`, [req.user.sub]);
    if (!emp) return reply.code(401).send({ error: 'Сотрудник не найден' });
    return emp;
  });

  app.post('/password', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { current, next } = req.body || {};
    const row = await one('SELECT password_hash FROM employees WHERE id = $1', [req.emp.id]);
    if (!(await verify(String(current || ''), row.password_hash))) {
      return reply.code(400).send({ error: 'Текущий пароль неверен' });
    }
    if (!next || String(next).length < 6) {
      return reply.code(400).send({ error: 'Новый пароль не короче 6 символов' });
    }
    await one('UPDATE employees SET password_hash = $1 WHERE id = $2 RETURNING id',
      [await hash(next), req.emp.id]);
    return { ok: true };
  });
}
