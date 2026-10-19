import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useProjectMutations, useProjects } from '@/hooks/project.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import { useUserStore } from '@/stores/user.store';
import type { ProjectEntity } from '@/types/project-platform';

export const useProjectsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUserStore((state) => state.user);
  const [includeArchived, setIncludeArchived] = useState(false);
  const projectsQuery = useProjects(includeArchived);
  const {
    createProject,
    archiveProject,
    deleteProject,
    createState,
    archiveState,
    deleteState,
  } = useProjectMutations();
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(
    searchParams.get('create') === '1',
  );
  const [confirmProject, setConfirmProject] = useState<ProjectEntity | null>(
    null,
  );
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const projects = projectsQuery.data?.projects?.data ?? [];
  const filteredProjects = projects.filter((project) =>
    `${project.name} ${project.description ?? ''}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const closeDialog = () => {
    setDialogOpen(false);
    setSearchParams({}, { replace: true });
  };

  const handleCreate = async () => {
    if (!name.trim() || !user?.id) return;

    try {
      const response = await createProject({
        name: name.trim(),
        description: description.trim(),
        ownerId: user.id,
      });
      toast.success(response.message || 'Proyecto creado.');
      setName('');
      setDescription('');
      closeDialog();
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const handleArchive = async (project: ProjectEntity) => {
    try {
      const response = await archiveProject(project.id);
      toast.success(response.message || 'Proyecto archivado.');
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!confirmProject) return;

    try {
      const response = await deleteProject(confirmProject.id);
      toast.success(response.message || 'Proyecto eliminado.');
      setConfirmProject(null);
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  return {
    projectsQuery,
    projects: filteredProjects,
    includeArchived,
    setIncludeArchived,
    query,
    setQuery,
    dialogOpen,
    setDialogOpen,
    confirmProject,
    setConfirmProject,
    name,
    setName,
    description,
    setDescription,
    user,
    createState,
    archiveState,
    deleteState,
    closeDialog,
    handleCreate,
    handleArchive,
    handleDelete,
  };
};
