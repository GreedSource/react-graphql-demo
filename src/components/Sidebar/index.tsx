import { APP_CONFIG } from '@/constants/config';
import { useUserStore } from '@/stores/user.store';

import { Avatar } from '@mui/material';
import SidebarRoutes from './item';

const Sidebar = () => {
  const { user } = useUserStore();
  return (
    <aside className="bg-[#1E293B] text-white w-64 h-full flex flex-col justify-between p-4">
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-indigo-400 text-2xl font-bold">🔷</span>
          <span className="text-xl font-bold">{APP_CONFIG.name}</span>
        </div>

        <SidebarRoutes />
      </div>

      <div className="flex items-center mt-6 gap-3">
        <Avatar
          alt="Tom Cook"
          src={`https://ui-avatars.com/api/?name=${user?.name}+${user?.lastname}`}
        />
        <div>
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
