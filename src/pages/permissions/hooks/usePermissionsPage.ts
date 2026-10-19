import { useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useActions } from '@/hooks/action.hook';
import { useModules } from '@/hooks/module.hook';
import { usePermissionMutations, usePermissions } from '@/hooks/permission.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import type { Permission } from '@/types/admin';
import type { PermissionFormState } from '../types';

const emptyPermission: PermissionFormState = {
  moduleId: '',
  actionId: '',
  description: '',
};

export const usePermissionsPage = () => {
  const permissionsQuery = usePermissions();
  const modulesQuery = useModules();
  const actionsQuery = useActions();
  const { createPermission, deletePermission, createState, deleteState } =
    usePermissionMutations();

  const permissions = useMemo(
    () => permissionsQuery.data?.permissions?.data ?? [],
    [permissionsQuery.data],
  );
  const modules = modulesQuery.data?.modules?.data ?? [];
  const actions = actionsQuery.data?.actions?.data ?? [];

  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);
  const [formState, setFormState] = useState<PermissionFormState>(emptyPermission);
  const permissionsScrollRef = useRef<HTMLDivElement>(null);

  const filteredPermissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return permissions.filter((permission) => {
      const matchesModule =
        moduleFilter === 'all' || permission.moduleKey === moduleFilter;
      const searchableText =
        `${permission.moduleKey} ${permission.actionKey} ${permission.description ?? ''}`.toLowerCase();
      return matchesModule && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [moduleFilter, permissions, query]);

  const groupedPermissions = useMemo(
    () =>
      filteredPermissions.reduce<Record<string, Permission[]>>((groups, permission) => {
        (groups[permission.moduleKey] ??= []).push(permission);
        return groups;
      }, {}),
    [filteredPermissions],
  );

  const moduleCount = useMemo(
    () => new Set(permissions.map((p) => p.moduleKey)).size,
    [permissions],
  );
  const actionCount = useMemo(
    () => new Set(permissions.map((p) => p.actionKey)).size,
    [permissions],
  );

  const queryError = permissionsQuery.error || modulesQuery.error || actionsQuery.error;

  const handleModuleFilterChange = (moduleKey: string) => {
    setModuleFilter(moduleKey);
    permissionsScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCreate = () => setDialogOpen(true);
  const closeCreate = () => {
    setDialogOpen(false);
    setFormState(emptyPermission);
  };

  const handleCreate = async () => {
    try {
      const response = await createPermission(formState);
      toast.success(response.message || 'Permiso creado.');
      closeCreate();
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePermission(deleteTarget.id);
      toast.success('Permiso eliminado.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  return {
    permissionsQuery,
    modulesQuery,
    actionsQuery,
    permissions,
    modules,
    actions,
    query,
    setQuery,
    moduleFilter,
    handleModuleFilterChange,
    dialogOpen,
    openCreate,
    closeCreate,
    deleteTarget,
    setDeleteTarget,
    formState,
    setFormState,
    filteredPermissions,
    groupedPermissions,
    moduleCount,
    actionCount,
    queryError,
    handleCreate,
    handleDelete,
    createState,
    deleteState,
    permissionsScrollRef,
  };
};
