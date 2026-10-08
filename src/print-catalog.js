// D1020-2 and М90-6 are the same WB product (nmID 319110173).
// Keep the supplied size barcodes available even when WB exports only М90-6.
const d1020Sizes = {
  '35': '2045212081308',
  '36': '2042616565298',
  '37': '2042616565304',
  '38': '2042616565311',
  '39': '2042616565328',
  '40': '2042616565335',
  '41': '2042616565342'
};

export function catalogForPrinting(catalog) {
  const existing = catalog['D1020-2'] || catalog['М90-6'] || {};
  const name = existing.name || 'Лоферы замшевые классические';
  const card = { name, brand: 'LOFERS', sizes: { ...d1020Sizes } };
  return {
    ...catalog,
    'D1020-2': { ...existing, ...card, cards: [card] }
  };
}
