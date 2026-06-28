// Точка входа приложения. Порядок импортов важен:
//   1) globals — кладёт React/ReactDOM/XLSX/JsBarcode/jspdf в window
//   2) config  — настраивает supabase, window.storage и WB_PROXY_URL
//   3) styles  — стили страницы
//   4) app     — основной код приложения (кладёт SkladLedger в window)
import './globals.js';
import './config.js';
import './styles.css';
import './app.js';

import React from 'react';
import { createRoot } from 'react-dom/client';
import AuthGate from './auth-gate.jsx';

// SkladLedger определён в app.js и выставлен в window.
const SkladLedger = window.SkladLedger;

// Оборачиваем приложение в «ворота» входа: без логина приложение не покажется.
createRoot(document.getElementById('root')).render(
  <AuthGate>
    <SkladLedger />
  </AuthGate>
);
