export default function LandingIcon({ name, size = 20, className = '', strokeWidth = 1.8 }) {
  const props = {
    className,
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (name) {
    case 'ticket':
      return (
        <svg {...props}>
          <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H17a2 2 0 0 1 2 2v1.2a2 2 0 0 0 0 3.6V14a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 13.5V8.5Z" />
          <path d="M12 6v12" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...props}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 17V11" />
          <path d="M12 17V7" />
          <path d="M16 17v-5" />
        </svg>
      );
    case 'megaphone':
      return (
        <svg {...props}>
          <path d="M4 10v4a2 2 0 0 0 2 2h1l4.5 3.5V6.5L7 10H6a2 2 0 0 0-2 2Z" />
          <path d="M14 8.5a4.5 4.5 0 0 1 0 7" />
          <path d="M16.5 6.5a7.5 7.5 0 0 1 0 11" />
        </svg>
      );
    case 'scan':
      return (
        <svg {...props}>
          <path d="M4 7V5a1 1 0 0 1 1-1h2" />
          <path d="M4 17v2a1 1 0 0 0 1 1h2" />
          <path d="M20 7V5a1 1 0 0 0-1-1h-2" />
          <path d="M20 17v2a1 1 0 0 1-1 1h-2" />
          <path d="M7 12h10" />
        </svg>
      );
    case 'check':
      return (
        <svg {...props}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...props}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case 'users':
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...props}>
          <path d="M12 3v4" />
          <path d="M12 17v4" />
          <path d="M3 12h4" />
          <path d="M17 12h4" />
          <path d="m5.6 5.6 2.8 2.8" />
          <path d="m15.6 15.6 2.8 2.8" />
          <path d="m18.4 5.6-2.8 2.8" />
          <path d="m8.4 15.6-2.8 2.8" />
        </svg>
      );
    case 'map-pin':
      return (
        <svg {...props}>
          <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...props}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
          <path d="M4 10h16" />
        </svg>
      );
    default:
      return null;
  }
}
