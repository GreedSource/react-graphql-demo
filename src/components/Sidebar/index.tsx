import { Avatar } from '@mui/material';
import SidebarRoutes from './item';
import { useUserStore } from '@/stores/user.store';
import { APP_CONFIG } from '@/constants/config';

const Sidebar = () => {
  const { user } = useUserStore();

  return (
    <aside className="hidden border-r border-slate-800 bg-slate-950 text-white lg:flex lg:w-72 lg:flex-col lg:justify-between lg:p-6">
      <div>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-lg font-bold text-sky-300">
            GA
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Control center
            </p>
            <span className="text-xl font-semibold text-white">
              {APP_CONFIG.name || 'GraphQL Admin'}
            </span>
          </div>
        </div>
        <SidebarRoutes />
      </div>

      <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
        <Avatar
          alt={`${user?.name} ${user?.lastname}`}
          src={`https://ui-avatars.com/api/?name=${user?.name}+${user?.lastname}`}
          sx={{ width: 32, height: 32 }}
        />
        <div>
          <p className="text-sm font-medium">
            {user?.name} {user?.lastname}
          </p>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
