import { useAuthActions } from '@/hooks/auth.hook';
import { useUserStore } from '@/stores/user.store';
import {
  LogoutRounded,
  Notifications as NotificationsIcon,
  PersonRounded,
} from '@mui/icons-material';
import { Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user } = useUserStore();
  const { performLogout } = useAuthActions();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const openProfileMenu = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              Plataforma administrativa
            </p>
            <h1 className="text-lg font-semibold text-slate-950">
              Gestion de acceso y catalogos
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <IconButton aria-label="view notifications" size="large" sx={{ color: '#0f172a', bgcolor: '#e2e8f0' }}>
              <NotificationsIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              className="rounded-full bg-white text-sm"
            >
              <Avatar
                alt="User Avatar"
                src={`https://ui-avatars.com/api/?name=${user?.name}+${user?.lastname}`}
                sx={{ width: 36, height: 36 }}
              />
            </IconButton>

            <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              open={openProfileMenu}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                className:
                  'w-52 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5',
              }}
            >
              <MenuItem
                onClick={() => {
                  handleProfileMenuClose();
                  navigate('/profile');
                }}
              >
                <PersonRounded fontSize="small" sx={{ mr: 1 }} />
                Perfil
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleProfileMenuClose();
                  void performLogout();
                }}
              >
                <LogoutRounded fontSize="small" sx={{ mr: 1 }} />
                Cerrar sesion
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
}
