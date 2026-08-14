import type * as React from 'react';

interface MobileToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileToggle: React.FC<MobileToggleProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed left-4 top-4 z-50 rounded-lg border border-border bg-surface-card p-2 text-text shadow-lg shadow-black/10 transition-all duration-200 hover:bg-surface-card-hover active:scale-95 lg:hidden"
      aria-label="Toggle sidebar"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
};

export default MobileToggle;
