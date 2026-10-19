import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useProjects } from '@/hooks/project.hook';
import {
  useProjectMemberMutations,
  useProjectMembers,
} from '@/hooks/member.hook';
import { useUsers } from '@/hooks/user.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import type { ProjectMemberEntity } from '@/types/project-platform';

export const useMembersPage = () => {
  const projectsQuery = useProjects();
  const usersQuery = useUsers();
  const projects = useMemo(
    () => projectsQuery.data?.projects?.data ?? [],
    [projectsQuery.data],
  );
  const users = usersQuery.data?.users?.data ?? [];
  const [projectId, setProjectId] = useState('');
  const membersQuery = useProjectMembers(projectId);
  const {
    addMember,
    updateMemberRole,
    removeMember,
    addState,
    updateState,
    removeState,
  } = useProjectMemberMutations(projectId);
  const members = membersQuery.data?.projectMembers?.data ?? [];
  const roles = Array.from(
    new Map(
      members.map((member) => [member.projectRole.id, member.projectRole]),
    ).values(),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<ProjectMemberEntity | null>(null);
  const [removeTarget, setRemoveTarget] =
    useState<ProjectMemberEntity | null>(null);
  const [userId, setUserId] = useState('');
  const [projectRoleId, setProjectRoleId] = useState('');

  useEffect(() => {
    if (!projectId && projects.length) setProjectId(projects[0].id);
  }, [projectId, projects]);

  const openCreate = () => {
    setSelectedMember(null);
    setUserId('');
    setProjectRoleId(roles[0]?.id ?? '');
    setDialogOpen(true);
  };

  const openEdit = (member: ProjectMemberEntity) => {
    setSelectedMember(member);
    setUserId(member.userId);
    setProjectRoleId(member.projectRoleId);
    setDialogOpen(true);
  };

  const save = async () => {
    try {
      const response = selectedMember
        ? await updateMemberRole({
            id: selectedMember.id,
            projectRoleId,
          })
        : await addMember({ projectId, userId, projectRoleId });
      toast.success(response.message || 'Miembro actualizado.');
      setDialogOpen(false);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const remove = async () => {
    if (!removeTarget) return;

    try {
      const response = await removeMember(removeTarget.id);
      toast.success(response.message || 'Miembro removido.');
      setRemoveTarget(null);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const userName = (id: string) => {
    const user = users.find((item) => item.id === id);
    return user ? `${user.name} ${user.lastname}` : id;
  };
  const selectedProject = projects.find((project) => project.id === projectId);
  const availableUsers = users.filter(
    (user) => !members.some((member) => member.userId === user.id),
  );
  const queryError =
    projectsQuery.error || membersQuery.error || usersQuery.error;

  return {
    projects,
    users,
    members,
    roles,
    projectId,
    setProjectId,
    selectedProject,
    selectedMember,
    removeTarget,
    setRemoveTarget,
    dialogOpen,
    setDialogOpen,
    userId,
    setUserId,
    projectRoleId,
    setProjectRoleId,
    availableUsers,
    queryError,
    addState,
    updateState,
    removeState,
    openCreate,
    openEdit,
    save,
    remove,
    userName,
  };
};
