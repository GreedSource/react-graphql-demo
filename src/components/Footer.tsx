import type * as React from 'react';
import { APP_CONFIG } from '@/constants/config';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-surface/70 px-6 py-3 text-center text-xs text-text-muted transition-all duration-300">
      {APP_CONFIG.name || 'RBAC Platform'} · {new Date().getFullYear()} ·
      Context-aware project access
    </footer>
  );
};

export default Footer;
