import bcrypt from 'bcryptjs';
import { one } from './db.js';

export const ROLES = { admin: 3, senior: 2, picker: 1 };

export const hash = (plain) => bcrypt.hash(plain, 10);
export const verify = (plain, digest) => bcrypt.compare(plain, digest);

// Проверяет токен и подтягивает актуального сотрудника: роль или блокировка
// могли измениться уже после выдачи токена.
export async function authenticate(req, reply) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.code(401).send({ error: 'Нужен вход в систему' });
  }
  const emp = await one(
    `SELECT id, phone, last_name, first_name, middle_name, birth_date,
            photo_path, role, status FROM employees WHERE id = $1`,
    [req.user.sub],
  );
  if (!emp) return reply.code(401).send({ error: 'Сотрудник не найден' });
  if (emp.status === 'blocked') return reply.code(403).send({ error: 'Доступ закрыт' });
  if (emp.status === 'pending') {
    return reply.code(403).send({ error: 'Ваша заявка ещё не подтверждена руководителем' });
  }
  req.emp = emp;
}

// Минимальный уровень роли: requireRole('senior') пропустит senior и admin.
export function requireRole(min) {
  return async (req, reply) => {
    if (!req.emp) return reply.code(401).send({ error: 'Нужен вход в систему' });
    if (ROLES[req.emp.role] < ROLES[min]) {
      return reply.code(403).send({ error: 'Недостаточно прав' });
    }
  };
}
