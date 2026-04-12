interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  transitionDuration: string;
}

export default function MobileOverlay({
  isOpen,
  onClose,
  transitionDuration,
}: MobileOverlayProps) {
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-${transitionDuration} lg:hidden ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden="true"
    />
  );
}
