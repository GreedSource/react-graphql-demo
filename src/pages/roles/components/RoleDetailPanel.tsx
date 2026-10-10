import type * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlined from '@mui/icons-material/EditOutlined';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import KeyRounded from '@mui/icons-material/KeyRounded';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { StateCard } from '@/components/ui/StateCard';
import { StatusChip } from '@/components/ui/StatusChip';
import type { PermissionItem, RoleDetailPanelProps } from '../types';

const RoleDetailPanel: React.FC<RoleDetailPanelProps> = ({
  selectedRole,
  permissions,
  assignedPermissions,
  assignIds,
  removeIds,
  onAssignIdsChange,
  onRemoveIdsChange,
  onEdit,
  onDelete,
  onSavePermissions,
  permissionsLoading,
}) => {
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const permissionScrollRef = useRef<HTMLDivElement>(null);
  const assignedIds = useMemo(
    () => new Set(assignedPermissions.map((permission) => permission.id)),
    [assignedPermissions],
  );
  const moduleOptions = useMemo(
    () => Array.from(new Set(permissions.map((permission) => permission.moduleKey))).sort(),
    [permissions],
  );
  const selectedModule = moduleFilter === 'all' || moduleOptions.includes(moduleFilter)
    ? moduleFilter
    : 'all';

  const groupedPermissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return permissions.reduce<Record<string, PermissionItem[]>>((groups, permission) => {
      const searchableText = `${permission.moduleKey} ${permission.actionKey} ${permission.description ?? ''}`.toLowerCase();
      if (selectedModule !== 'all' && permission.moduleKey !== selectedModule) return groups;
      if (normalizedQuery && !searchableText.includes(normalizedQuery)) return groups;
      (groups[permission.moduleKey] ??= []).push(permission);
      return groups;
    }, {});
  }, [permissions, query, selectedModule]);

  if (!selectedRole) {
    return <StateCard title="Sin selección" description="Selecciona un rol para ver su detalle." />;
  }

  const isChecked = (permissionId: string) =>
    (assignedIds.has(permissionId) && !removeIds.includes(permissionId)) || assignIds.includes(permissionId);

  const togglePermission = (permissionId: string) => {
    if (assignedIds.has(permissionId)) {
      onRemoveIdsChange(removeIds.includes(permissionId) ? removeIds.filter((id) => id !== permissionId) : [...removeIds, permissionId]);
      return;
    }
    onAssignIdsChange(assignIds.includes(permissionId) ? assignIds.filter((id) => id !== permissionId) : [...assignIds, permissionId]);
  };

  const toggleModule = (modulePermissions: PermissionItem[]) => {
    const shouldSelect = modulePermissions.some((permission) => !isChecked(permission.id));
    const moduleIds = new Set(modulePermissions.map((permission) => permission.id));
    const nextAssignIds = assignIds.filter((id) => !moduleIds.has(id));
    const nextRemoveIds = removeIds.filter((id) => !moduleIds.has(id));

    modulePermissions.forEach((permission) => {
      if (shouldSelect && !assignedIds.has(permission.id)) nextAssignIds.push(permission.id);
      if (!shouldSelect && assignedIds.has(permission.id)) nextRemoveIds.push(permission.id);
    });
    onAssignIdsChange(nextAssignIds);
    onRemoveIdsChange(nextRemoveIds);
  };

  const toggleModuleVisibility = (moduleKey: string) => {
    setCollapsedModules((current) => ({
      ...current,
      [moduleKey]: !current[moduleKey],
    }));
  };

  const handleModuleFilterChange = (moduleKey: string) => {
    setModuleFilter(moduleKey);
    permissionScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    if (moduleKey !== 'all') {
      setCollapsedModules((current) => ({ ...current, [moduleKey]: false }));
    }
  };

  const pendingChanges = assignIds.length + removeIds.length;
  const selectedCount = permissions.filter((permission) => isChecked(permission.id)).length;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-surface-elevated p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
              <KeyRounded />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-text">{selectedRole.name}</h3>
                <StatusChip active={selectedRole.active} />
              </div>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-text-secondary">{selectedRole.description || 'Este rol no tiene descripción.'}</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button size="small" variant="outlined" startIcon={<EditOutlined />} onClick={onEdit}>Editar</Button>
            <Button size="small" color="error" startIcon={<DeleteOutlineRounded />} onClick={onDelete}>Eliminar</Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-text-secondary">
          <span className="rounded-lg bg-surface-card px-2.5 py-1.5">{selectedCount} permisos activos</span>
          <span className="rounded-lg bg-surface-card px-2.5 py-1.5">{permissions.length} disponibles</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface-card">
        <div className="flex flex-col gap-3 border-b border-border bg-surface-elevated p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-text">Permisos del rol</p>
            <p className="mt-1 text-xs text-text-muted">Activa permisos individuales o un módulo completo.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <TextField value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar permiso" size="small" sx={{ width: { xs: '100%', sm: 220 }, bgcolor: 'var(--bg-card)' }} slotProps={{ input: { startAdornment: <SearchRounded className="mr-2 text-text-muted" fontSize="small" /> } }} />
            <TextField
              select
              size="small"
              label="Módulo"
              value={selectedModule}
              onChange={(event) => handleModuleFilterChange(event.target.value)}
              sx={{ width: { xs: '100%', sm: 180 }, bgcolor: 'var(--bg-card)' }}
            >
              <MenuItem value="all">Todos</MenuItem>
              {moduleOptions.map((moduleKey) => <MenuItem key={moduleKey} value={moduleKey}>{moduleKey}</MenuItem>)}
            </TextField>
          </div>
        </div>

        {selectedModule !== 'all' ? (
          <div className="flex items-center gap-2 border-b border-border bg-accent-soft/50 px-4 py-2.5 text-xs text-text-secondary">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span>Asignando permisos del módulo <strong className="text-text">{selectedModule}</strong></span>
          </div>
        ) : null}

        <div ref={permissionScrollRef} className="role-permission-scroll space-y-3 overflow-y-auto overscroll-contain p-3">
          {Object.entries(groupedPermissions).map(([moduleKey, modulePermissions]) => {
            const selectedInModule = modulePermissions.filter((permission) => isChecked(permission.id)).length;
            const collapsed = collapsedModules[moduleKey] ?? false;
            return (
              <section className="overflow-hidden rounded-2xl border border-border bg-surface-card" key={moduleKey}>
                <div className="sticky top-0 z-[1] flex items-center gap-2 border-b border-border bg-surface-elevated/95 px-3 py-2 backdrop-blur">
                  <Checkbox
                    size="small"
                    checked={selectedInModule === modulePermissions.length}
                    indeterminate={selectedInModule > 0 && selectedInModule < modulePermissions.length}
                    onChange={() => toggleModule(modulePermissions)}
                    inputProps={{ 'aria-label': `Seleccionar todos los permisos de ${moduleKey}` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold uppercase tracking-[0.08em] text-text-secondary">{moduleKey}</p>
                    <p className="text-xs text-text-muted">{selectedInModule} de {modulePermissions.length} seleccionados</p>
                  </div>
                  <button
                    type="button"
                    aria-expanded={!collapsed}
                    aria-label={`${collapsed ? 'Mostrar' : 'Ocultar'} permisos de ${moduleKey}`}
                    onClick={() => toggleModuleVisibility(moduleKey)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-text-muted transition hover:bg-surface-card hover:text-text"
                  >
                    <ExpandMoreRounded className={`transition-transform ${collapsed ? '-rotate-90' : ''}`} />
                  </button>
                </div>
                {!collapsed ? (
                  <div className="grid gap-2 p-2 sm:grid-cols-2 2xl:grid-cols-3">
                    {modulePermissions.map((permission) => {
                      const checked = isChecked(permission.id);
                      const pending = assignIds.includes(permission.id) || removeIds.includes(permission.id);
                      return (
                        <label className={`flex min-h-16 cursor-pointer items-center gap-2 rounded-xl border p-2 transition ${checked ? 'border-accent/40 bg-accent-soft/50' : 'border-border/70 bg-surface-card hover:border-accent/30 hover:bg-surface-elevated'}`} key={permission.id}>
                          <Checkbox size="small" checked={checked} onChange={() => togglePermission(permission.id)} sx={{ p: 0.75 }} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-text">{permission.actionKey}</span>
                            {permission.description ? <span className="mt-0.5 block truncate text-xs text-text-muted">{permission.description}</span> : <span className="mt-0.5 block text-xs text-text-muted">Sin descripción</span>}
                          </span>
                          {pending ? <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" title="Cambio pendiente" /> : null}
                        </label>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
          {Object.keys(groupedPermissions).length === 0 ? <p className="p-8 text-center text-sm text-text-muted">No se encontraron permisos.</p> : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-border bg-surface-elevated p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">{pendingChanges ? `${pendingChanges} cambios sin guardar` : 'Sin cambios pendientes'}</p>
          <Button variant="contained" size="small" onClick={() => void onSavePermissions()} disabled={!pendingChanges || permissionsLoading}>Guardar permisos</Button>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailPanel;
