import type * as React from 'react';
import { useAuthActions } from '@/hooks/auth.hook';
import { useUserStore } from '@/stores/user.store';
import { useThemeStore } from '@/stores/theme.store';
import {
  LogoutRounded,
  Notifications as NotificationsIcon,
  PersonRounded,
  SearchRounded,
} from '@mui/icons-material';
import { Avatar, Badge, Dialog, DialogContent, IconButton, Menu, MenuItem, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useProjects } from '@/hooks/project.hook';
import { useTasks } from '@/hooks/task.hook';
import { useAuditLogs } from '@/hooks/audit.hook';
import { formatDateTime } from '@/lib/date-format';
import { SIDEBAR_ROUTES } from '@/config/sidebar-routes.config';

const routeLabels = SIDEBAR_ROUTES.flatMap((route) => 'to' in route ? [{ to: route.to, label: route.label }] : route.children.map((child) => ({ to: child.to, label: child.label })));

const Navbar: React.FC = () => {
  const { user } = useUserStore();
  const { theme } = useThemeStore();
  const { performLogout } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const projectsQuery = useProjects();
  const tasksQuery = useTasks();
  const auditQuery = useAuditLogs(10);
  const projects = projectsQuery.data?.projects?.data ?? [];
  const tasks = tasksQuery.data?.tasks?.data ?? [];
  const auditEvents = auditQuery.data?.auditLogs?.data ?? [];
  const getProjectName = (projectId: string) => projects.find((project) => project.id === projectId)?.name ?? 'Proyecto';

  const openProfileMenu = Boolean(anchorEl);
  const isDark = theme === 'dark';
  const sectionName = routeLabels
    .filter((route) => location.pathname === route.to || location.pathname.startsWith(`${route.to}/`))
    .sort((left, right) => right.to.length - left.to.length)[0]?.label ?? 'Workspace';

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const searchResults = [
    ...projects.map((project) => ({ id: project.id, label: project.name, meta: project.description || project.status, to: `/projects/${project.id}` })),
    ...tasks.map((task) => ({ id: task.id, label: task.title, meta: getProjectName(task.projectId), to: '/tasks' })),
  ].filter((item) => `${item.label} ${item.meta}`.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <nav className="sticky top-0 z-20 border-b border-border/70 bg-surface-card/80 backdrop-blur-2xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[1560px] items-center justify-between gap-4">
          <div className="min-w-0 capitalize">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent">Espacio de trabajo</p>
            <p className="truncate text-sm font-semibold capitalize text-text">{sectionName}</p>
          </div>
          <button onClick={() => setSearchOpen(true)} className="hidden h-10 w-full max-w-md items-center gap-2 rounded-xl border border-border/80 bg-surface-elevated/70 px-3 text-left text-sm text-text-muted transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-sm md:flex">
            <SearchRounded fontSize="small" />
            <span className="flex-1">Buscar proyectos, tareas o personas</span>
            <kbd className="rounded border border-border bg-surface-card px-1.5 py-0.5 text-[10px]">⌘ K</kbd>
          </button>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <IconButton
              aria-label="Ver notificaciones"
              size="medium"
              onClick={(event) => setNotificationsAnchor(event.currentTarget)}
              sx={{
                color: 'var(--text-secondary)',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: 'var(--bg-card-hover)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              <Badge badgeContent={auditEvents.filter((event) => event.status === 'denied').length} color="error"><NotificationsIcon /></Badge>
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="Abrir menú de usuario"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              className="rounded-lg bg-surface-card text-sm"
              sx={{
                bgcolor: 'transparent',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: isDark
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
                  width: 32,
                  height: 32,
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
                Cerrar sesión
              </MenuItem>
            </Menu>
            <Menu anchorEl={notificationsAnchor} open={Boolean(notificationsAnchor)} onClose={() => setNotificationsAnchor(null)} PaperProps={{ sx: { width: 340, mt: 1 } }}>
            <div className="border-b border-border px-4 py-3"><p className="text-sm font-semibold">Notificaciones</p><p className="text-xs text-text-muted">Actividad reciente de tus proyectos</p></div>
              {auditEvents.map((event) => <MenuItem key={event.id} onClick={() => { setNotificationsAnchor(null); navigate('/activity'); }} sx={{ alignItems: 'flex-start', whiteSpace: 'normal', py: 1.5 }}><span className={`mr-3 mt-1.5 h-2 w-2 shrink-0 rounded-full ${event.status === 'denied' ? 'bg-red-500' : 'bg-emerald-500'}`} /><span><span className="block text-sm font-medium">{event.module}.{event.action}</span><span className="block text-xs text-text-muted">{event.resourceType || 'Recurso'} · {formatDateTime(event.createdAt)}</span></span></MenuItem>)}
            </Menu>
          </div>
        </div>
      </div>
      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { position: 'fixed', top: 80, m: 0, borderRadius: 2 } }}>
        <DialogContent sx={{ p: 0 }}>
          <TextField autoFocus fullWidth value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Busca proyectos o tareas..." variant="standard" slotProps={{ input: { disableUnderline: true, startAdornment: <SearchRounded className="mx-4 text-text-muted" /> } }} sx={{ p: 1 }} />
          <div className="max-h-80 overflow-y-auto border-t border-border p-2">
            {searchResults.map((result) => <button className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left hover:bg-surface-elevated" key={`${result.to}-${result.id}`} onClick={() => { setSearchOpen(false); setSearchQuery(''); navigate(result.to); }}><span><span className="block text-sm font-medium">{result.label}</span><span className="block text-xs text-text-muted">{result.meta}</span></span><span className="text-xs text-text-muted">Abrir</span></button>)}
            {searchResults.length === 0 ? <p className="p-6 text-center text-sm text-text-muted">No se encontraron resultados.</p> : null}
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
