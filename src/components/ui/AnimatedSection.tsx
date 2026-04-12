import { useState, useEffect, type ReactNode, type CSSProperties } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  scale?: boolean;
  style?: CSSProperties;
  className?: string;
}

const DIRECTION_MAP: Record<string, string> = {
  up: 'translateY(8px)',
  down: 'translateY(-8px)',
  left: 'translateX(8px)',
  right: 'translateX(-8px)',
  none: 'none',
};

const DEFAULT_DURATION = 400;

export default function AnimatedSection({
  children,
  delay = 0,
  duration = DEFAULT_DURATION,
  direction = 'up',
  scale = false,
  style,
  className = '',
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const initialTransform = `${DIRECTION_MAP[direction] || DIRECTION_MAP.up}${scale ? ' scale(0.98)' : ''}`;
  const finalTransform = scale ? 'translateY(0) scale(1)' : 'translateY(0)';

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? finalTransform : initialTransform,
        transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        transitionDelay: `${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
