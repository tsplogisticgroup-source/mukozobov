// Знак «Смены» — кожаная бирка: монограмма и прострочка по канту.
// Плашка красится через currentColor, буква и строчка всегда кремовые,
// поэтому знак одинаково читается и в тёмной шапке, и на светлой странице.
export default function Mark({ className = 'brand__mark' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="currentColor" />
      <rect
        x="5" y="5" width="54" height="54" rx="11"
        fill="none" stroke="#f9f4ec" strokeOpacity="0.5"
        strokeWidth="1.6" strokeDasharray="4 4"
      />
      <text
        x="32" y="45" textAnchor="middle"
        fontFamily="Spectral, Georgia, serif" fontSize="38" fontWeight="700"
        fill="#f9f4ec"
      >
        С
      </text>
    </svg>
  );
}
