import type * as React from 'react';

interface MobileToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileToggle: React.FC<MobileToggleProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="fixed left-4 top-4 z-[60] grid h-11 w-11 place-items-center rounded-2xl border border-white/[0.12] bg-[var(--nav-bg)] text-white shadow-lg shadow-black/20 transition-all duration-200 hover:bg-[var(--nav-surface)] active:scale-95 lg:hidden"
      aria-expanded={isOpen}
      aria-controls="main-sidebar"
      aria-label={isOpen ? 'Cerrar navegación' : 'Abrir navegación'}
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
