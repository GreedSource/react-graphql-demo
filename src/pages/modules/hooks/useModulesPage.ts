import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useModuleMutations, useModules } from '@/hooks/module.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import type { CreateModuleInput, UpdateModuleInput } from '@/types/admin';
import type { ModuleSummary } from '../types';

const emptyModule: CreateModuleInput = {
  name: '',
  key: '',
  description: '',
  active: true,
};

export const useModulesPage = () => {
  const modulesQuery = useModules();
  const { createModule, updateModule, createState, updateState } = useModuleMutations();
  const modules = useMemo(() => modulesQuery.data?.modules?.data ?? [], [modulesQuery.data]);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<CreateModuleInput & { id?: string }>(emptyModule);

  const openCreate = () => {
    setDialogMode('create');
    setFormState(emptyModule);
    setDialogOpen(true);
  };

  const openEdit = (module?: ModuleSummary) => {
    if (!module) return;
    setDialogMode('edit');
    setFormState({
      id: module.id,
      name: module.name,
      key: module.key,
      description: module.description || '',
      active: module.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const response =
        dialogMode === 'create'
          ? await createModule(formState)
          : await updateModule(buildUpdateInput());
      toast.success(response.message || (dialogMode === 'create' ? 'Modulo creado.' : 'Modulo actualizado.'));
      setDialogOpen(false);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const buildUpdateInput = (): UpdateModuleInput => {
    const id = formState.id;
    if (!id) {
      throw new Error('No se encontró el identificador del módulo a editar.');
    }

    return {
      id,
      name: formState.name,
      key: formState.key,
      description: formState.description,
      active: formState.active,
    };
  };

  return {
    modulesQuery,
    modules,
    dialogMode,
    dialogOpen,
    setDialogOpen,
    formState,
    setFormState,
    openCreate,
    openEdit,
    handleSave,
    createState,
    updateState,
  };
};
