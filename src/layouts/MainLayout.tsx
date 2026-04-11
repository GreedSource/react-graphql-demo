import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageTransition from '../components/ui/PageTransition';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-surface-elevated to-surface transition-colors duration-300">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
