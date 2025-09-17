
import React from 'react';

export const GeologyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L2 8.5l10 6.5L22 8.5 12 2z" />
    <path d="M2 15.5l10 6.5l10-6.5" />
    <path d="M2 8.5v7l10 6.5v-7L2 8.5z" />
    <path d="M22 8.5v7l-10 6.5v-7L22 8.5z" />
    <path d="M12 2v20" />
  </svg>
);
