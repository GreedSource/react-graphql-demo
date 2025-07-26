import { APP_CONFIG } from '@/constants/config';

const Footer = () => {
  return (
    <footer className="bg-gray-200 text-center py-2 text-sm">
      © {new Date().getFullYear()} {APP_CONFIG.name}
    </footer>
  );
};

export default Footer;
