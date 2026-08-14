import { useMutation, useQuery } from '@apollo/client';
import { ARCHIVE_PROJECT, CREATE_PROJECT, DELETE_PROJECT, UPDATE_PROJECT } from '@/graphql/project/mutations';
import { PROJECT, PROJECTS } from '@/graphql/project/queries';
import { ensureSuccess } from '@/lib/graphql';
import type { ApiResponse } from '@/types/admin';
import type { CreateProjectInput, ProjectEntity, UpdateProjectInput } from '@/types/project-platform';

interface ProjectsResult { projects: ApiResponse<ProjectEntity[]>; }
interface ProjectResult { project: ApiResponse<ProjectEntity>; }
interface ProjectMutationsResult { createProject: ApiResponse<ProjectEntity>; updateProject: ApiResponse<ProjectEntity>; archiveProject: ApiResponse<ProjectEntity>; deleteProject: ApiResponse<boolean>; }

export function useProjects(includeArchived = false) { return useQuery<ProjectsResult>(PROJECTS, { variables: { includeArchived }, fetchPolicy: 'cache-and-network' }); }
export function useProject(id?: string) { return useQuery<ProjectResult>(PROJECT, { variables: { id }, skip: !id, fetchPolicy: 'cache-and-network' }); }
export function useProjectMutations() {
  const [createMutation, createState] = useMutation<ProjectMutationsResult>(CREATE_PROJECT);
  const [updateMutation, updateState] = useMutation<ProjectMutationsResult>(UPDATE_PROJECT);
  const [archiveMutation, archiveState] = useMutation<ProjectMutationsResult>(ARCHIVE_PROJECT);
  const [deleteMutation, deleteState] = useMutation<ProjectMutationsResult>(DELETE_PROJECT);
  const refresh = [{ query: PROJECTS, variables: { includeArchived: false } }, { query: PROJECTS, variables: { includeArchived: true } }];
  const createProject = async (input: CreateProjectInput) => ensureSuccess((await createMutation({ variables: { input }, refetchQueries: refresh, awaitRefetchQueries: true })).data?.createProject, 'No se pudo crear el proyecto.');
  const updateProject = async (input: UpdateProjectInput) => ensureSuccess((await updateMutation({ variables: { input }, refetchQueries: [...refresh, { query: PROJECT, variables: { id: input.id } }], awaitRefetchQueries: true })).data?.updateProject, 'No se pudo actualizar el proyecto.');
  const archiveProject = async (id: string) => ensureSuccess((await archiveMutation({ variables: { id }, refetchQueries: refresh, awaitRefetchQueries: true })).data?.archiveProject, 'No se pudo archivar el proyecto.');
  const deleteProject = async (id: string) => ensureSuccess((await deleteMutation({ variables: { id }, refetchQueries: refresh, awaitRefetchQueries: true })).data?.deleteProject, 'No se pudo eliminar el proyecto.');
  return { createProject, updateProject, archiveProject, deleteProject, createState, updateState, archiveState, deleteState };
}
