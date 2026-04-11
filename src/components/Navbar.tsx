import { useAuthActions } from '@/hooks/auth.hook';
import { useUserStore } from '@/stores/user.store';
import { useThemeStore } from '@/stores/theme.store';
import {
  LogoutRounded,
  Notifications as NotificationsIcon,
  PersonRounded,
} from '@mui/icons-material';
import { Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Navbar() {
  const { user } = useUserStore();
  const { theme } = useThemeStore();
  const { performLogout } = useAuthActions();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const openProfileMenu = Boolean(anchorEl);
  const isDark = theme === 'dark';

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <nav
      className="sticky top-0 z-20 border-b border-border bg-surface-card/80 backdrop-blur transition-all duration-300"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center justify-between">
          <div className="transition-transform duration-200 hover:translate-x-0.5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Plataforma administrativa
            </p>
            <h1 className="text-lg font-semibold text-text">
              Gestion de acceso y catalogos
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <IconButton
              aria-label="view notifications"
              size="large"
              sx={{
                color: 'inherit',
                bgcolor: 'surface.elevated',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: 'surface.card-hover',
                  transform: 'scale(1.08)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
            >
              <NotificationsIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              className="rounded-full bg-surface-card text-sm"
              sx={{
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.08)',
                  boxShadow: isDark
                    ? '0 4px 12px rgba(0,0,0,0.4)'
                    : '0 4px 12px rgba(0,0,0,0.1)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
            >
              <Avatar
                alt="User Avatar"
                src={`https://ui-avatars.com/api/?name=${user?.name}+${user?.lastname}`}
                sx={{
                  width: 36,
                  height: 36,
                  transition: 'transform 200ms',
                  bgcolor: 'var(--accent)',
                }}
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
                  'w-52 origin-top-right rounded-md bg-surface-card py-1 shadow-lg ring-1 ring-border',
                sx: {
                  '& .MuiMenuItem-root': {
                    color: 'var(--text-primary)',
                    transition: 'all 150ms',
                    '&:hover': {
                      bgcolor: 'accent.soft',
                      transform: 'translateX(4px)',
                    },
                  },
                },
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
