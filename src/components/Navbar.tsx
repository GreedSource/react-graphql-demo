import type * as React from 'react';
import { useAuthActions } from '@/hooks/auth.hook';
import { useUserStore } from '@/stores/user.store';
import { useThemeStore } from '@/stores/theme.store';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonRounded from '@mui/icons-material/PersonRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
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
    <nav className="sticky top-0 z-20 border-b border-border/75 bg-surface-card/85 shadow-[0_8px_24px_rgba(24,44,65,0.03)] backdrop-blur-2xl">
      <div className="pl-16 pr-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex h-[5rem] w-full max-w-[1480px] items-center justify-between gap-3 sm:gap-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">Tu espacio de trabajo</p>
            <p className="mt-0.5 truncate text-[15px] font-bold capitalize text-text">{sectionName}</p>
          </div>
          <button onClick={() => setSearchOpen(true)} aria-label="Buscar proyectos, tareas o personas" className="hidden h-11 w-full max-w-md items-center gap-2 rounded-2xl border border-border/80 bg-surface-elevated/75 px-3.5 text-left text-sm text-text-muted transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:bg-surface-card hover:shadow-sm md:flex">
            <SearchRounded fontSize="small" />
            <span className="flex-1">Buscar proyectos, tareas o personas</span>
            <kbd className="rounded-lg border border-border bg-surface-card px-2 py-1 text-[10px] font-semibold text-text-muted">⌘ K</kbd>
          </button>
          <div className="flex items-center gap-1.5">
            <IconButton
              aria-label="Buscar"
              size="medium"
              onClick={() => setSearchOpen(true)}
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
            <IconButton
              aria-label="Ver notificaciones"
              size="medium"
              onClick={(event) => setNotificationsAnchor(event.currentTarget)}
              sx={{
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-primary)',
                bgcolor: 'var(--bg-card)',
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
              className="rounded-2xl border border-border bg-surface-card px-1.5 text-sm"
              sx={{
                bgcolor: 'transparent',
                gap: 1,
                minHeight: 44,
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
                  width: 34,
                  height: 34,
                  transition: 'transform 200ms',
                  bgcolor: 'var(--accent)',
                }}
              />
              <span className="hidden max-w-28 text-left leading-tight lg:block">
                <span className="block truncate text-xs font-bold text-text">{user?.name || 'Tu perfil'}</span>
                <span className="block truncate text-[10px] text-text-muted">{user?.role?.name || 'Cuenta activa'}</span>
              </span>
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
            <Menu anchorEl={notificationsAnchor} open={Boolean(notificationsAnchor)} onClose={() => setNotificationsAnchor(null)} PaperProps={{ sx: { width: { xs: 'calc(100vw - 32px)', sm: 360 }, maxWidth: 'calc(100vw - 32px)', mt: 1 } }}>
            <div className="border-b border-border px-4 py-3.5"><p className="text-sm font-bold">Notificaciones</p><p className="mt-0.5 text-xs text-text-muted">Actividad reciente de tus proyectos</p></div>
              {auditEvents.map((event) => <MenuItem key={event.id} onClick={() => { setNotificationsAnchor(null); navigate('/activity'); }} sx={{ alignItems: 'flex-start', whiteSpace: 'normal', py: 1.5 }}><span className={`mr-3 mt-1.5 h-2 w-2 shrink-0 rounded-full ${event.status === 'denied' ? 'bg-red-500' : 'bg-emerald-500'}`} /><span><span className="block text-sm font-medium">{event.module}.{event.action}</span><span className="block text-xs text-text-muted">{event.resourceType || 'Recurso'} · {formatDateTime(event.createdAt)}</span></span></MenuItem>)}
            </Menu>
          </div>
        </div>
      </div>
      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { position: 'fixed', top: { xs: 76, sm: 88 }, m: 0, borderRadius: 3 } }}>
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
