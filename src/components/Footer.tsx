import { APP_CONFIG } from '@/constants/config';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface-card/80 px-6 py-4 text-center text-sm text-text-muted transition-all duration-300 hover:bg-surface-card/90">
      © {new Date().getFullYear()} {APP_CONFIG.name || 'GraphQL Admin'}
    </footer>
  );
};

export default Footer;
