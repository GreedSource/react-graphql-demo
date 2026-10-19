import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useProject, useProjectMutations } from '@/hooks/project.hook';
import { useProjectMembers } from '@/hooks/member.hook';
import { useTasks } from '@/hooks/task.hook';
import { useUsers } from '@/hooks/user.hook';
import { getApolloErrorMessage } from '@/lib/graphql';

export const useProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const projectQuery = useProject(projectId);
  const tasksQuery = useTasks(projectId);
  const membersQuery = useProjectMembers(projectId);
  const usersQuery = useUsers();
  const { updateProject, updateState } = useProjectMutations();
  const project = projectQuery.data?.project?.data;
  const tasks = tasksQuery.data?.tasks?.data ?? [];
  const members = membersQuery.data?.projectMembers?.data ?? [];
  const users = usersQuery.data?.users?.data ?? [];
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const error =
    projectQuery.error ||
    tasksQuery.error ||
    membersQuery.error ||
    usersQuery.error;

  const userName = (id: string) => {
    const user = users.find((item) => item.id === id);
    return user ? `${user.name} ${user.lastname}` : id;
  };

  const openEdit = () => {
    if (!project) return;
    setName(project.name);
    setDescription(project.description ?? '');
    setEditOpen(true);
  };

  const save = async () => {
    if (!project || !name.trim()) return;

    try {
      const response = await updateProject({
        id: project.id,
        name: name.trim(),
        description,
      });
      toast.success(response.message || 'Proyecto actualizado.');
      setEditOpen(false);
    } catch (requestError) {
      toast.error(getApolloErrorMessage(requestError));
    }
  };

  const openTaskCreation = () => {
    if (!projectId) return;
    navigate(`/tasks?create=1&projectId=${projectId}`);
  };

  const openMembersPage = () => navigate('/members');

  return {
    projectId,
    project,
    tasks,
    members,
    error,
    updateState,
    editOpen,
    setEditOpen,
    name,
    setName,
    description,
    setDescription,
    userName,
    openEdit,
    save,
    openTaskCreation,
    openMembersPage,
  };
};
