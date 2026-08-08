import type * as React from 'react';

interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  transitionDuration: string;
}

const MobileOverlay: React.FC<MobileOverlayProps> = ({
  isOpen,
  onClose,
  transitionDuration,
}) => {
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-${transitionDuration} lg:hidden ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden="true"
    />
  );
};

export default MobileOverlay;
