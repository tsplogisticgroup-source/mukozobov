// Точка входа приложения. Порядок импортов важен:
//   1) globals — кладёт React/ReactDOM/XLSX/JsBarcode/jspdf в window
//   2) config  — настраивает window.storage и WB_PROXY_URL
//   3) styles  — стили страницы
//   4) app     — основной код приложения (внизу сам вызывает render)
import './globals.js';
import './config.js';
import './styles.css';
import './app.js';
