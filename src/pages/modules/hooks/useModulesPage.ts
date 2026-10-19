import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useModule, useModuleMutations, useModules } from '@/hooks/module.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import type { CreateModuleInput, UpdateModuleInput } from '@/types/admin';

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
  const [selectedId, setSelectedId] = useState('');
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<CreateModuleInput & { id?: string }>(emptyModule);
  const moduleDetailQuery = useModule(selectedId);

  useEffect(() => {
    if (!selectedId && modules.length > 0) setSelectedId(modules[0].id);
  }, [modules, selectedId]);

  const selectedModule = useMemo(
    () => moduleDetailQuery.data?.module?.data ?? modules.find((module) => module.id === selectedId),
    [moduleDetailQuery.data?.module?.data, modules, selectedId],
  );

  const openCreate = () => {
    setDialogMode('create');
    setFormState(emptyModule);
    setDialogOpen(true);
  };

  const openEdit = () => {
    if (!selectedModule) return;
    setDialogMode('edit');
    setFormState({
      id: selectedModule.id,
      name: selectedModule.name,
      key: selectedModule.key,
      description: selectedModule.description || '',
      active: selectedModule.active,
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
    const id = formState.id ?? selectedModule?.id;
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
    selectedId,
    setSelectedId,
    dialogMode,
    dialogOpen,
    setDialogOpen,
    formState,
    setFormState,
    selectedModule,
    openCreate,
    openEdit,
    handleSave,
    createState,
    updateState,
  };
};
