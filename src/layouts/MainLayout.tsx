import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)]">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
