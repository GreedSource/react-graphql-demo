import type * as React from 'react';
import { useMemo, useState } from 'react';
import { Button, Checkbox, TextField } from '@mui/material';
import { SearchRounded } from '@mui/icons-material';
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
  const assignedIds = useMemo(
    () => new Set(assignedPermissions.map((permission) => permission.id)),
    [assignedPermissions],
  );

  const groupedPermissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return permissions.reduce<Record<string, PermissionItem[]>>((groups, permission) => {
      const searchableText = `${permission.moduleKey} ${permission.actionKey} ${permission.description ?? ''}`.toLowerCase();
      if (normalizedQuery && !searchableText.includes(normalizedQuery)) return groups;
      (groups[permission.moduleKey] ??= []).push(permission);
      return groups;
    }, {});
  }, [permissions, query]);

  if (!selectedRole) {
    return <StateCard title="Sin seleccion" description="Selecciona un rol para ver su detalle." />;
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

  const pendingChanges = assignIds.length + removeIds.length;
  const selectedCount = permissions.filter((permission) => isChecked(permission.id)).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3"><h3 className="text-xl font-semibold text-text">{selectedRole.name}</h3><StatusChip active={selectedRole.active} /></div>
          <p className="mt-1 text-sm text-text-secondary">{selectedRole.description || 'Este rol no tiene descripcion.'}</p>
        </div>
        <div className="flex shrink-0 gap-2"><Button size="small" variant="outlined" onClick={onEdit}>Editar</Button><Button size="small" color="error" onClick={onDelete}>Eliminar</Button></div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="flex flex-col gap-3 border-b border-border bg-surface-elevated p-3 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-semibold text-text">Permisos del rol</p><p className="text-xs text-text-muted">{selectedCount} de {permissions.length} seleccionados</p></div>
          <TextField value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar permiso" size="small" sx={{ width: { xs: '100%', sm: 230 }, bgcolor: 'var(--bg-card)' }} slotProps={{ input: { startAdornment: <SearchRounded className="mr-2 text-text-muted" fontSize="small" /> } }} />
        </div>

        <div className="max-h-[430px] overflow-y-auto overscroll-contain">
          {Object.entries(groupedPermissions).map(([moduleKey, modulePermissions]) => {
            const selectedInModule = modulePermissions.filter((permission) => isChecked(permission.id)).length;
            return (
              <section key={moduleKey}>
                <button type="button" onClick={() => toggleModule(modulePermissions)} className="sticky top-0 z-[1] flex w-full items-center gap-3 border-y border-border bg-surface-elevated/95 px-3 py-2 text-left backdrop-blur first:border-t-0">
                  <Checkbox size="small" checked={selectedInModule === modulePermissions.length} indeterminate={selectedInModule > 0 && selectedInModule < modulePermissions.length} tabIndex={-1} />
                  <span className="flex-1 text-xs font-bold uppercase text-text-secondary">{moduleKey}</span>
                  <span className="text-xs text-text-muted">{selectedInModule}/{modulePermissions.length}</span>
                </button>
                <div className="divide-y divide-border">
                  {modulePermissions.map((permission) => {
                    const checked = isChecked(permission.id);
                    const pending = assignIds.includes(permission.id) || removeIds.includes(permission.id);
                    return (
                      <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition hover:bg-surface-elevated" key={permission.id}>
                        <Checkbox size="small" checked={checked} onChange={() => togglePermission(permission.id)} />
                        <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-text">{permission.actionKey}</span>{permission.description ? <span className="block truncate text-xs text-text-muted">{permission.description}</span> : null}</span>
                        {pending ? <span className="rounded bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">Pendiente</span> : null}
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {Object.keys(groupedPermissions).length === 0 ? <p className="p-8 text-center text-sm text-text-muted">No se encontraron permisos.</p> : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-card p-3">
          <p className="text-xs text-text-muted">{pendingChanges ? `${pendingChanges} cambios sin guardar` : 'Sin cambios pendientes'}</p>
          <Button variant="contained" size="small" onClick={() => void onSavePermissions()} disabled={!pendingChanges || permissionsLoading}>Guardar permisos</Button>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailPanel;
