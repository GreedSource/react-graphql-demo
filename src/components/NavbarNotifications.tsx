import type * as React from 'react';
import { useState } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { useAuditLogs } from '@/hooks/audit.hook';
import { formatDateTime } from '@/lib/date-format';

const NavbarNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const auditQuery = useAuditLogs(10);
  const auditEvents = auditQuery.data?.auditLogs?.data ?? [];
  const deniedCount = auditEvents.filter(
    (event) => event.status === 'denied',
  ).length;

  const openActivity = () => {
    setAnchor(null);
    navigate('/activity');
  };

  return (
    <>
      <IconButton
        aria-label="Ver notificaciones"
        size="medium"
        onClick={(event) => setAnchor(event.currentTarget)}
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
        <Badge badgeContent={deniedCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{
          sx: {
            width: { xs: 'calc(100vw - 32px)', sm: 360 },
            maxWidth: 'calc(100vw - 32px)',
            mt: 1,
          },
        }}
      >
        <div className="border-b border-border px-4 py-3.5">
          <p className="text-sm font-bold">Notificaciones</p>
          <p className="mt-0.5 text-xs text-text-muted">
            Actividad reciente de tus proyectos
          </p>
        </div>
        {auditEvents.map((event) => (
          <MenuItem
            key={event.id}
            onClick={openActivity}
            sx={{ alignItems: 'flex-start', whiteSpace: 'normal', py: 1.5 }}
          >
            <span
              className={`mr-3 mt-1.5 h-2 w-2 shrink-0 rounded-full ${event.status === 'denied' ? 'bg-red-500' : 'bg-emerald-500'}`}
            />
            <span>
              <span className="block text-sm font-medium">
                {event.module}.{event.action}
              </span>
              <span className="block text-xs text-text-muted">
                {event.resourceType || 'Recurso'} ·{' '}
                {formatDateTime(event.createdAt)}
              </span>
            </span>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default NavbarNotifications;
