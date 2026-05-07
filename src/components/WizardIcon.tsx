type Props = { name: string; size?: number; className?: string };

const paths: Record<string, string> = {
  bath: "M4 12h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4zm0 0V5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1M9 12V5",
  layers: "M2 12l10-8 10 8M2 17l10-8 10 8M2 22l10-8 10 8",
  square: "M3 3h18v18H3z",
  "door-open": "M13 4h3a2 2 0 0 1 2 2v14H6V6a2 2 0 0 1 2-2h3m-1 9h2",
  zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  droplets: "M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05zM16.5 22c2.5 0 4.5-2.07 4.5-4.56 0-1.3-.64-2.55-1.93-3.6S16.65 11.8 16.5 10c-.15 1.8-1.28 3.19-2.57 4.24C12.64 15.29 12 16.54 12 17.44 12 19.93 14 22 16.5 22z",
  flame: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  utensils: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7",
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  triangle: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
  "file-text": "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  building: "M6 2h12v20H6zM2 7h4M18 7h4M2 12h4M18 12h4M2 17h4M18 17h4M10 22v-5h4v5",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  leaf: "M2 22 16 8M15.5 6.5a5 5 0 1 1-7.07 7.07L6 22M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3",
  sun: "M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
  umbrella: "M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7",
  paintbrush: "M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.58a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3zM9 8c-2 3-4 3.5-7 4l8 8c.5-3 1-5 4-7",
  check: "M20 6 9 17l-5-5",
};

const fallbackPaths: Record<string, string> = {
  default: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
};

export function WizardIcon({ name, size = 20, className }: Props) {
  const d = paths[name] ?? fallbackPaths.default;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {d.split("M").filter(Boolean).map((segment, i) => (
        <path key={i} d={"M" + segment} />
      ))}
    </svg>
  );
}
