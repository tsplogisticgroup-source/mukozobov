// Совместимость со старыми остатками и FBS-соответствиями, где был один GTIN.
export function gtinValues(value) {
  return [...new Set((Array.isArray(value) ? value : [value]).filter(g => typeof g === 'string' && g))];
}

export function sizeGtins(size) {
  if (!size) return [];
  return [...new Set([
    ...gtinValues(size.gtins),
    ...gtinValues(size.gtin),
    ...(size.codes || []).map(code => /^01\d{14}21/.test(code) ? code.slice(2, 16) : '').filter(Boolean),
  ])];
}

export function mergeGtinValues(current, incoming) {
  return [...new Set([...gtinValues(current), ...gtinValues(incoming)])];
}
