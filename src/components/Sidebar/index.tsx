import { Avatar } from '@mui/material';
import SidebarRoutes from './item';
import { useUserStore } from '@/stores/user.store';
import { APP_CONFIG } from '@/constants/config';

const Sidebar = () => {
  const { user } = useUserStore();

  return (
    <aside className="bg-[#1E293B] text-white w-16 md:w-64 h-full flex flex-col justify-between p-4 md:p-4 transition-all duration-300">
      {/* Top section */}
      <div>
        {/* Logo */}
        <div className="flex justify-center md:justify-start items-center space-x-0 md:space-x-2 mb-6">
          <span className="text-indigo-400 text-2xl font-bold">🔷</span>
          <span className="text-xl font-bold hidden md:inline">
            {APP_CONFIG.name}
          </span>
        </div>

        {/* Routes */}
        <SidebarRoutes />
      </div>

      {/* User Info */}
      <div className="flex flex-col items-center md:flex-row md:items-center mt-6 gap-2 md:gap-3">
        <Avatar
          alt={`${user?.name} ${user?.lastname}`}
          src={`https://ui-avatars.com/api/?name=${user?.name}+${user?.lastname}`}
          sx={{ width: 32, height: 32 }}
        />
        <div className="hidden md:block">
          <p className="text-sm font-medium">
            {user?.name} {user?.lastname}
          </p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
