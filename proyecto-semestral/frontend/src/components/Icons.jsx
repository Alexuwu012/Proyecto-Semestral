// Iconos de línea, minimalistas, en lugar de emojis. Heredan color (currentColor)
// y tamaño por props para poder reutilizarse en cualquier contexto de la UI.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

export function IconPin({ size = 16, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 21c-4.2-4.4-6.5-7.9-6.5-11A6.5 6.5 0 0 1 18.5 10c0 3.1-2.3 6.6-6.5 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

export function IconUser({ size = 16, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1-3.6 4-5.5 7-5.5s6 1.9 7 5.5" />
    </svg>
  );
}

export function IconCamera({ size = 18, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 8.5h3l1.4-2h7.2l1.4 2H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.4" />
    </svg>
  );
}

export function IconZoom({ size = 14, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.6-4.6" />
      <path d="M10.5 8v5M8 10.5h5" />
    </svg>
  );
}

export function IconArrowLeft({ size = 16, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
  );
}

export function IconArrowRight({ size = 16, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconLogout({ size = 15, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

// Marca de la app: un punto geolocalizado dentro de un anillo de aviso.
export function BrandMark({ size = 26, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.35" />
      <path
        d="M16 25c-3.6-3.8-5.6-6.8-5.6-9.4A5.6 5.6 0 0 1 21.6 15.6c0 2.6-2 5.6-5.6 9.4Z"
        fill="currentColor"
      />
      <circle cx="16" cy="15.4" r="1.9" fill="var(--paper)" />
    </svg>
  );
}
