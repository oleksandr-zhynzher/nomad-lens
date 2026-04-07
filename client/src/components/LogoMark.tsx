interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <circle cx="27" cy="27" r="20" stroke="#C99662" strokeWidth="2.75" />
      <circle cx="27" cy="27" r="13" stroke="#A5A3A7" strokeWidth="1.75" />
      <path
        d="M14 27H40"
        stroke="#A5A3A7"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M39.5 39.5L50.5 50.5"
        stroke="#C99662"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
