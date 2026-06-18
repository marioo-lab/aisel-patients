import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};

function Svg({
  size = 16,
  strokeWidth = 2,
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      {...props}
    >
      {children}
    </svg>
  );
}

export function PlusIcon({ strokeWidth = 2.4, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} strokeLinecap="round" {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function EyeIcon({ strokeWidth = 1.9, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function AlertCircleIcon({ strokeWidth = 2, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
    </Svg>
  );
}

export function SunIcon({ strokeWidth = 1.9, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <circle cx="12" cy="12" r="4.2" />
      <path
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MoonIcon({ strokeWidth = 1.9, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />
    </Svg>
  );
}

export function SlidersIcon({ strokeWidth = 1.9, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <path d="M4 6h10M4 12h7M4 18h13" strokeLinecap="round" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="15" cy="12" r="2" />
      <circle cx="20" cy="18" r="2" />
    </Svg>
  );
}

export function ChevronDownIcon({ strokeWidth = 2, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function LogoutIcon({ strokeWidth = 1.9, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TriangleAlertIcon({ strokeWidth = 1.9, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <path d="M10.3 3.7 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
    </Svg>
  );
}

export function SearchIcon({ strokeWidth = 2, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </Svg>
  );
}

export function RefreshIcon({ strokeWidth = 1.9, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <path
        d="M21 12a9 9 0 1 1-3-6.7L21 8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CloseIcon({ strokeWidth = 2.2, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </Svg>
  );
}

export function DotsIcon({ size = 17, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}

export function ChevronRightIcon({ strokeWidth = 2, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <path d="m9 18 6-6-6-6" />
    </Svg>
  );
}

export function ChevronLeftIcon({ strokeWidth = 2.2, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <path d="m15 18-6-6 6-6" />
    </Svg>
  );
}

export function EditIcon({ strokeWidth = 1.9, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinejoin="round" />
    </Svg>
  );
}

export function TrashIcon({ strokeWidth = 1.9, ...p }: IconProps) {
  return (
    <Svg strokeWidth={strokeWidth} {...p}>
      <path
        d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
