import { NavLink, Navigate, Route, Routes, Link } from 'react-router-dom';
import { useAuth } from './lib/auth.jsx';
import { api } from './lib/api.js';
import { initials, ROLE_NAME, ROLE_SHORT } from './lib/format.js';
import Mark from './components/Mark.jsx';

import AuthPage from './pages/AuthPage.jsx';
import PendingPage from './pages/PendingPage.jsx';
import ShiftsPage from './pages/ShiftsPage.jsx';
import MyShiftsPage from './pages/MyShiftsPage.jsx';
import CrewPage from './pages/CrewPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import RatesPage from './pages/RatesPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// Один список разделов на обе раскладки: боковое меню на ПК и вкладки на телефоне.
function useMenu() {
  const { can } = useAuth();
  return [
    { to: '/', label: 'График', end: true },
    { to: '/my', label: 'Мои смены' },
    ...(can.manageShifts ? [{ to: '/crew', label: 'Люди' }] : []),
    ...(can.manageShifts ? [{ to: '/reports', label: 'Отчёты' }] : []),
    ...(can.seeMoney ? [{ to: '/rates', label: 'Ставки' }] : []),
  ];
}

function Avatar({ emp }) {
  const photo = api.fileUrl(emp?.photo_path);
  return photo
    ? <img className="avatar" src={photo} alt="" />
    : <span className="avatar">{initials(emp)}</span>;
}

function Shell({ children }) {
  const { me } = useAuth();
  const menu = useMenu();

  return (
    <div className="app">
      {/* боковая панель — только на широком экране */}
      <aside className="side">
        <div className="side__brand">
          <Mark />
          <span className="brand__name">СМЕНА</span>
        </div>
        <nav className="side__nav">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.end}
              className={({ isActive }) => 'side__link' + (isActive ? ' side__link--on' : '')}
            >
              {m.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/profile" className="side__me">
          <Avatar emp={me} />
          <span>
            <span className="side__me-name">{me.last_name} {me.first_name}</span>
            <span className="side__me-role">{ROLE_NAME[me.role]}</span>
          </span>
        </Link>
      </aside>

      <div className="content">
        {/* шапка и вкладки — только на телефоне */}
        <header className="topbar">
          <div className="topbar__row">
            <span className="brand">
              <Mark />
              <span className="brand__name">СМЕНА</span>
            </span>
            <Link to="/profile" className="topbar__me">
              <span className="small">{ROLE_SHORT[me?.role]}</span>
              <Avatar emp={me} />
            </Link>
          </div>
        </header>

        <nav className="tabs">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.end}
              className={({ isActive }) => 'tab' + (isActive ? ' tab--on' : '')}
            >
              {m.label}
            </NavLink>
          ))}
        </nav>

        <main className="main">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  const { me, loading } = useAuth();

  if (loading) return <div className="loading">Загрузка…</div>;
  if (!me) return <AuthPage />;
  // Пока руководитель не подтвердил заявку, человек видит только её статус.
  if (me.status !== 'active') return <PendingPage />;

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<ShiftsPage />} />
        <Route path="/my" element={<MyShiftsPage />} />
        <Route path="/crew" element={<CrewPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/rates" element={<RatesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
