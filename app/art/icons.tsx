import type { CSSProperties, FC } from "react";

type P = { size?: number; className?: string; style?: CSSProperties };

export const SpeedIcon: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M4 14a8 8 0 0 1 16 0" fill="none" stroke="#3ce0ff" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 14l5-4" stroke="#39ff88" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="14" r="2" fill="#39ff88" />
  </svg>
);

export const RingIcon: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <circle cx="12" cy="12" r="8" fill="none" stroke="#39ff88" strokeWidth="2.4" />
    <circle cx="12" cy="12" r="3.5" fill="none" stroke="#3ce0ff" strokeWidth="1.6" />
  </svg>
);

export const PassIcon: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M3 12h14" stroke="#ff3caa" strokeWidth="2" strokeLinecap="round" />
    <path d="M13 7l6 5-6 5" fill="none" stroke="#39ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TrophyIcon: FC<P> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" fill="none" stroke="#39ff88" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5" fill="none" stroke="#39ff88" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M10 15h4v3h-4z" fill="none" stroke="#39ff88" strokeWidth="1.8" /><path d="M8 21h8" stroke="#39ff88" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const XIcon: FC<P> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="M3 3l7.6 9.9L3.4 21h2.3l5.8-6.7L16.6 21H21l-8-10.4L20.4 3h-2.3l-5.4 6.2L7.7 3H3Z" fill="currentColor" />
  </svg>
);
