import type * as React from 'react';
import { useMemo, useState } from 'react';
import SearchRounded from '@mui/icons-material/SearchRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import TextField from '@mui/material/TextField';
import { StateCard } from '@/components/ui/StateCard';
import { StatusChip } from '@/components/ui/StatusChip';
import type { Role } from '@/types/admin';

interface RoleListProps {
  roles: Role[];
  selectedId: string;
  onSelect: (roleId: string) => void;
  onCreate: () => void;
  loading?: boolean;
}

const getRoleInitials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'R';
};

const RoleList: React.FC<RoleListProps> = ({
  roles,
  selectedId,
  onSelect,
  onCreate,
  loading = false,
}) => {
  const [query, setQuery] = useState('');
  const filteredRoles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return roles;

    return roles.filter((role) =>
      `${role.name} ${role.description ?? ''}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query, roles]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          size="small"
          fullWidth
          placeholder="Buscar un rol..."
          slotProps={{
            input: {
              startAdornment: <SearchRounded className="mr-2 text-text-muted" fontSize="small" />,
            },
          }}
        />
        <span className="shrink-0 text-xs font-semibold text-text-muted">
          {filteredRoles.length} {filteredRoles.length === 1 ? 'rol' : 'roles'}
        </span>
      </div>

      {loading && !roles.length ? (
        <StateCard title="Cargando roles" description="Consultando la configuración de acceso." loading />
      ) : null}

      {!loading && !roles.length ? (
        <StateCard
          title="Aún no hay roles"
          description="Crea el primer rol para comenzar a organizar el acceso."
          actionLabel="Crear rol"
          onAction={onCreate}
          icon={<ShieldRounded fontSize="small" />}
        />
      ) : null}

      {roles.length > 0 && filteredRoles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-semibold text-text">No encontramos ese rol</p>
          <p className="mt-1 text-sm text-text-muted">Prueba con otro nombre o descripción.</p>
        </div>
      ) : null}

      {filteredRoles.length > 0 ? (
        <div className="max-h-[min(62vh,620px)] space-y-2 overflow-y-auto pr-1">
          {filteredRoles.map((role) => {
            const selected = role.id === selectedId;

            return (
              <button
                key={role.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(role.id)}
                className={`group flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
                  selected
                    ? 'border-accent/50 bg-accent-soft shadow-sm'
                    : 'border-border bg-surface-card hover:border-accent/35 hover:bg-surface-elevated'
                }`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${selected ? 'bg-accent text-accent-contrast' : 'bg-surface-elevated text-text-secondary'}`}>
                  {getRoleInitials(role.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-bold text-text">{role.name}</span>
                    <StatusChip active={role.active} />
                  </span>
                  <span className="mt-1 block truncate text-xs text-text-muted">
                    {role.description || 'Sin descripción'}
                  </span>
                  <span className="mt-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                    <ShieldRounded sx={{ fontSize: 15 }} />
                    {role.permissions.length} {role.permissions.length === 1 ? 'permiso' : 'permisos'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default RoleList;
