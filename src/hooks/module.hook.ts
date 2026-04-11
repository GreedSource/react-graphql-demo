import { useMutation, useQuery } from '@apollo/client';
import { CREATE_MODULE, UPDATE_MODULE } from '@/graphql/module/mutations';
import { MODULE, MODULES } from '@/graphql/module/queries';
import { ensureSuccess } from '@/lib/graphql';
import type {
  ApiResponse,
  CreateModuleInput,
  ModuleEntity,
  UpdateModuleInput,
} from '@/types/admin';

interface ModulesQueryResult {
  modules: ApiResponse<ModuleEntity[]>;
}

interface ModuleQueryResult {
  module: ApiResponse<ModuleEntity>;
}

interface ModuleMutationResult {
  createModule: ApiResponse<ModuleEntity>;
  updateModule: ApiResponse<ModuleEntity>;
}

export function useModules() {
  return useQuery<ModulesQueryResult>(MODULES, {
    fetchPolicy: 'cache-and-network',
  });
}

export function useModule(id?: string) {
  return useQuery<ModuleQueryResult>(MODULE, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });
}

export function useModuleMutations() {
  const [createModuleMutation, createState] =
    useMutation<ModuleMutationResult>(CREATE_MODULE);
  const [updateModuleMutation, updateState] =
    useMutation<ModuleMutationResult>(UPDATE_MODULE);

  const createModule = async (input: CreateModuleInput) => {
    const { data } = await createModuleMutation({
      variables: { input },
      refetchQueries: [{ query: MODULES }],
      awaitRefetchQueries: true,
    });

    return ensureSuccess(data?.createModule, 'No se pudo crear el modulo.');
  };

  const updateModule = async (input: UpdateModuleInput) => {
    const { data } = await updateModuleMutation({
      variables: { input },
      refetchQueries: [{ query: MODULES }, { query: MODULE, variables: { id: input.id } }],
      awaitRefetchQueries: true,
    });

    return ensureSuccess(data?.updateModule, 'No se pudo actualizar el modulo.');
  };

  return {
    createModule,
    updateModule,
    createState,
    updateState,
  };
}
