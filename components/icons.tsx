import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function Icon({
  size = 18,
  children,
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export const I = {
  arrow: (p?: IconProps) => (
    <Icon {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  ),
  plus: (p?: IconProps) => (
    <Icon {...p}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  ),
  invoice: (p?: IconProps) => (
    <Icon {...p}>
      <path d="M7 3h8l4 4v14H7z" />
      <path d="M15 3v4h4" />
      <path d="M10 12h6M10 16h4" />
    </Icon>
  ),
  people: (p?: IconProps) => (
    <Icon {...p}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19c.6-3 2.8-5 6-5s5.4 2 6 5" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M16.2 14.2c2.3.4 3.8 2 4.3 4.8" />
    </Icon>
  ),
  stamp: (p?: IconProps) => (
    <Icon {...p}>
      <path d="M8 14h8l1.5 6h-11z" />
      <path d="M9 14V8a3 3 0 0 1 6 0v6" />
    </Icon>
  ),
  spark: (p?: IconProps) => (
    <Icon {...p}>
      <path d="M12 3l1.2 6.3L19 12l-5.8 2.7L12 21l-1.2-6.3L5 12l5.8-2.7z" />
    </Icon>
  ),
  layout: (p?: IconProps) => (
    <Icon {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M9 9v11" />
    </Icon>
  ),
  settings: (p?: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M17.8 6.2l-1.4 1.4M7.6 16.4l-1.4 1.4" />
    </Icon>
  ),
  home: (p?: IconProps) => (
    <Icon {...p}>
      <path d="M4 11.5 12 4l8 7.5V20H4z" />
      <path d="M10 20v-6h4v6" />
    </Icon>
  ),
  send: (p?: IconProps) => (
    <Icon {...p}>
      <path d="M4 12 20 4l-6 16-2.5-6.5z" />
    </Icon>
  ),
  print: (p?: IconProps) => (
    <Icon {...p}>
      <path d="M7 8V4h10v4" />
      <rect x="5" y="8" width="14" height="8" rx="1.5" />
      <path d="M8 16v4h8v-4" />
    </Icon>
  ),
  check: (p?: IconProps) => (
    <Icon {...p}>
      <path d="M5 13l4 4L19 7" />
    </Icon>
  ),
  x: (p?: IconProps) => (
    <Icon {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  ),
  menu: (p?: IconProps) => (
    <Icon {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  ),
  lock: (p?: IconProps) => (
    <Icon {...p}>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Icon>
  ),
  card: (p?: IconProps) => (
    <Icon {...p}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </Icon>
  ),
  trash: (p?: IconProps) => (
    <Icon {...p}>
      <path d="M5 7h14M10 7V5h4v2M8 7l1 12h6l1-12" />
    </Icon>
  ),
  copy: (p?: IconProps) => (
    <Icon {...p}>
      <rect x="8" y="8" width="11" height="11" rx="1.5" />
      <path d="M5 16V5h11" />
    </Icon>
  ),
  download: (p?: IconProps) => (
    <Icon {...p}>
      <path d="M12 4v10M8 10l4 4 4-4M5 19h14" />
    </Icon>
  ),
  share: (p?: IconProps) => (
    <Icon {...p}>
      <circle cx="18" cy="5" r="2.4" />
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="19" r="2.4" />
      <path d="M8.2 11l7.6-5M8.2 13l7.6 5" />
    </Icon>
  ),
  chat: (p?: IconProps) => (
    <Icon {...p}>
      <path d="M5 6h14v10H8l-3 3z" />
    </Icon>
  ),
};
