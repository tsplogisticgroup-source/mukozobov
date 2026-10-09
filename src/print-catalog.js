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

// D1020-6 = М90-8, WB nmID 316910622.
const d1020SixSizes = {
  '35': '2045212078438',
  '36': '2042580004960',
  '37': '2042580004977',
  '38': '2042580004984',
  '39': '2042580004991',
  '40': '2042580005004',
  '41': '2042580005011'
};

export function catalogForPrinting(catalog) {
  const existing = catalog['D1020-2'] || catalog['М90-6'] || {};
  const name = existing.name || 'Лоферы замшевые классические';
  const card = { name, brand: 'LOFERS', sizes: { ...d1020Sizes } };
  const sixExisting = catalog['D1020-6'] || catalog['М90-8'] || catalog['M90-8'] || {};
  const sixCard = {
    name: sixExisting.name || 'Лоферы замшевые классические',
    brand: 'LOFERS',
    sizes: { ...d1020SixSizes }
  };
  return {
    ...catalog,
    'D1020-2': { ...existing, ...card, cards: [card] },
    'D1020-6': { ...sixExisting, ...sixCard, cards: [sixCard] }
  };
}
