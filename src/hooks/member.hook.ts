import { useMutation, useQuery } from '@apollo/client';
import { ADD_PROJECT_MEMBER, REMOVE_PROJECT_MEMBER, UPDATE_PROJECT_MEMBER_ROLE } from '@/graphql/member/mutations';
import { PROJECT_MEMBERS } from '@/graphql/member/queries';
import { ensureSuccess } from '@/lib/graphql';
import type { ApiResponse } from '@/types/admin';
import type { AddProjectMemberInput, ProjectMemberEntity, UpdateProjectMemberRoleInput } from '@/types/project-platform';
interface MembersResult { projectMembers: ApiResponse<ProjectMemberEntity[]>; }
interface MemberMutationResult { addProjectMember: ApiResponse<ProjectMemberEntity>; updateProjectMemberRole: ApiResponse<ProjectMemberEntity>; removeProjectMember: ApiResponse<boolean>; }
export function useProjectMembers(projectId?: string) { return useQuery<MembersResult>(PROJECT_MEMBERS, { variables: { projectId }, skip: !projectId, fetchPolicy: 'cache-and-network' }); }
export function useProjectMemberMutations(projectId?: string) {
  const refetch = projectId ? [{ query: PROJECT_MEMBERS, variables: { projectId } }] : [];
  const [addMutation, addState] = useMutation<MemberMutationResult>(ADD_PROJECT_MEMBER);
  const [updateMutation, updateState] = useMutation<MemberMutationResult>(UPDATE_PROJECT_MEMBER_ROLE);
  const [removeMutation, removeState] = useMutation<MemberMutationResult>(REMOVE_PROJECT_MEMBER);
  const addMember = async (input: AddProjectMemberInput) => ensureSuccess((await addMutation({ variables: { input }, refetchQueries: [{ query: PROJECT_MEMBERS, variables: { projectId: input.projectId } }], awaitRefetchQueries: true })).data?.addProjectMember, 'No se pudo agregar el miembro.');
  const updateMemberRole = async (input: UpdateProjectMemberRoleInput) => ensureSuccess((await updateMutation({ variables: { input }, refetchQueries: refetch, awaitRefetchQueries: true })).data?.updateProjectMemberRole, 'No se pudo cambiar el rol.');
  const removeMember = async (id: string) => ensureSuccess((await removeMutation({ variables: { id }, refetchQueries: refetch, awaitRefetchQueries: true })).data?.removeProjectMember, 'No se pudo remover el miembro.');
  return { addMember, updateMemberRole, removeMember, addState, updateState, removeState };
}
