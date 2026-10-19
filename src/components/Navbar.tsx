import type * as React from 'react';
import { useCallback, useState } from 'react';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useLocation, useNavigate } from 'react-router-dom';
import { SIDEBAR_ROUTES } from '@/config/sidebar-routes.config';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useLogoutAction } from '@/hooks/auth.hook';
import { useUserStore } from '@/stores/user.store';
import { useThemeStore } from '@/stores/theme.store';
import NavbarNotifications from './NavbarNotifications';
import NavbarSearch from './NavbarSearch';

const routeLabels = SIDEBAR_ROUTES.flatMap((route) =>
  'to' in route
    ? [{ to: route.to, label: route.label }]
    : route.children.map((child) => ({ to: child.to, label: child.label })),
).concat({ to: '/profile', label: 'Mi perfil' });

const Navbar: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);
  const { performLogout } = useLogoutAction();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileMenuAnchor, setProfileMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const sectionName =
    routeLabels
      .filter(
        (route) =>
          location.pathname === route.to ||
          location.pathname.startsWith(`${route.to}/`),
      )
      .sort((left, right) => right.to.length - left.to.length)[0]?.label ??
    'Workspace';

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = () => setSearchOpen(false);
  const closeProfileMenu = () => setProfileMenuAnchor(null);
  const navigateToProfile = () => {
    closeProfileMenu();
    navigate('/profile');
  };
  const logout = () => {
    closeProfileMenu();
    void performLogout();
  };

  return (
    <nav className="sticky top-0 z-20 border-b border-border/75 bg-surface-card/85 shadow-[0_8px_24px_rgba(24,44,65,0.03)] backdrop-blur-2xl">
      <div className="pl-16 pr-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex h-[5rem] w-full max-w-[1920px] items-center justify-between gap-3 sm:gap-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
              Tu espacio de trabajo
            </p>
            <p className="mt-0.5 truncate text-[15px] font-bold capitalize text-text">
              {sectionName}
            </p>
          </div>

          <button
            type="button"
            onClick={openSearch}
            aria-label="Buscar proyectos, tareas o personas"
            className="hidden h-11 w-full max-w-md items-center gap-2 rounded-2xl border border-border/80 bg-surface-elevated/75 px-3.5 text-left text-sm text-text-muted transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:bg-surface-card hover:shadow-sm md:flex"
          >
            <SearchRounded fontSize="small" />
            <span className="flex-1">Buscar proyectos, tareas o personas</span>
            <kbd className="rounded-lg border border-border bg-surface-card px-2 py-1 text-[10px] font-semibold text-text-muted">
              ⌘ K
            </kbd>
          </button>

          <div className="flex items-center gap-1.5">
            <IconButton
              aria-label="Buscar"
              size="medium"
              onClick={openSearch}
              className="md:hidden"
              sx={{
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-primary)',
                bgcolor: 'var(--bg-card)',
              }}
            >
              <SearchRounded fontSize="small" />
            </IconButton>
            <ThemeToggle />
            <NavbarNotifications />
            <IconButton
              size="large"
              edge="end"
              aria-label="Abrir menú de usuario"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={(event) => setProfileMenuAnchor(event.currentTarget)}
              className="rounded-2xl border border-border bg-surface-card px-1.5 text-sm"
              sx={{
                bgcolor: 'transparent',
                gap: 1,
                minHeight: 44,
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow:
                    theme === 'dark'
                      ? '0 10px 24px rgba(0,0,0,0.28)'
                      : '0 10px 24px rgba(23,33,38,0.10)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              <Avatar
                alt="User Avatar"
                src={`https://ui-avatars.com/api/?name=${user?.name}+${user?.lastname}`}
                sx={{
                  width: 34,
                  height: 34,
                  transition: 'transform 200ms',
                  bgcolor: 'var(--accent)',
                }}
              />
              <span className="hidden max-w-28 text-left leading-tight lg:block">
                <span className="block truncate text-xs font-bold text-text">
                  {user?.name || 'Tu perfil'}
                </span>
                <span className="block truncate text-[10px] text-text-muted">
                  {user?.role?.name || 'Cuenta activa'}
                </span>
              </span>
            </IconButton>

            <Menu
              id="profile-menu"
              anchorEl={profileMenuAnchor}
              open={Boolean(profileMenuAnchor)}
              onClose={closeProfileMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                className:
                  'w-56 origin-top-right rounded-2xl bg-surface-card py-1.5 shadow-lg ring-1 ring-border',
                sx: {
                  '& .MuiMenuItem-root': {
                    color: 'var(--text-primary)',
                    transition: 'all 150ms',
                    '&:hover': {
                      bgcolor: 'var(--accent-soft)',
                      transform: 'translateX(3px)',
                    },
                  },
                },
              }}
            >
              <MenuItem onClick={navigateToProfile}>
                <PersonRounded fontSize="small" sx={{ mr: 1 }} />
                Perfil
              </MenuItem>
              <MenuItem onClick={logout}>
                <LogoutRounded fontSize="small" sx={{ mr: 1 }} />
                Cerrar sesión
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
      <NavbarSearch
        open={searchOpen}
        onClose={closeSearch}
        onOpen={openSearch}
      />
    </nav>
  );
};

export default Navbar;
