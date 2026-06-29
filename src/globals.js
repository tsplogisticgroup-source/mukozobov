// Подключаем библиотеки из npm и кладём их в глобальную область (window),
// чтобы существующий код в app.js мог обращаться к ним как раньше:
//   React, ReactDOM, XLSX, JsBarcode, window.jspdf
// Это временный мост на Фазу 1 (запуск без переписывания). В Фазе 2,
// когда будем разбивать app.js на компоненты, заменим на обычные import.

import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import * as XLSX from 'xlsx';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

window.React = React;
window.ReactDOM = ReactDOMClient;       // даёт ReactDOM.createRoot(...)
window.XLSX = XLSX;
window.JsBarcode = JsBarcode;
window.jspdf = { jsPDF };               // app.js обращается к window.jspdf.jsPDF
window.JSZip = JSZip;                    // упаковка пакета ТЗ в ZIP
