import { useAuth } from '../lib/auth.jsx';
import { fullName } from '../lib/format.js';
import Mark from '../components/Mark.jsx';

export default function PendingPage() {
  const { me, logout, refresh } = useAuth();
  const blocked = me.status === 'blocked';

  return (
    <div className="auth-page">
      <div className="auth">
        <div className="auth__logo">
          <Mark />
          <span className="auth__logo-name">СМЕНА</span>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 24 }}>
            {blocked ? 'Доступ закрыт' : 'Заявка на рассмотрении'}
          </h2>
          <p className="muted" style={{ marginBottom: 0 }}>
            {blocked
              ? 'Обратитесь к руководителю склада.'
              : `${fullName(me)}, вы зарегистрированы. Руководитель подтвердит вас и назначит должность — после этого появится график смен.`}
          </p>
        </div>

        <div className="stack">
          {!blocked && (
            <button className="btn btn--accent btn--wide" onClick={refresh}>Проверить снова</button>
          )}
          <button className="btn btn--ghost btn--wide" onClick={logout}>Выйти</button>
        </div>
      </div>
    </div>
  );
}
