import { APP_CONFIG } from '@/constants/config';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200/70 bg-white/80 px-6 py-4 text-center text-sm text-slate-500 transition-colors duration-200 hover:bg-white/90">
      © {new Date().getFullYear()} {APP_CONFIG.name || 'GraphQL Admin'}
    </footer>
  );
};

export default Footer;
