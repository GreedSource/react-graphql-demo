import * as React from 'react';
import AddRounded from '@mui/icons-material/AddRounded';
import ArchiveRounded from '@mui/icons-material/ArchiveRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormDialog } from '@/components/ui/FormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import { getApolloErrorMessage } from '@/lib/graphql';
import { useProjectsPage } from './hooks/useProjectsPage';

const ProjectsPageContent: React.FC = () => {
  const {
    projectsQuery,
    projects,
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
  } = useProjectsPage();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Portafolio"
        title="Proyectos"
        description="Administra proyectos activos y archivados desde un solo lugar."
        actions={
          <PermissionAction
            permission="projects.create"
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => setDialogOpen(true)}
          >
            Nuevo proyecto
          </PermissionAction>
        }
      />

      {projectsQuery.error ? (
        <Alert severity="error">
          {getApolloErrorMessage(projectsQuery.error)}
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-card p-3 sm:flex-row sm:items-center">
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          size="small"
          placeholder="Buscar proyecto"
          slotProps={{
            input: {
              startAdornment: (
                <SearchRounded
                  className="mr-2 text-text-muted"
                  fontSize="small"
                />
              ),
            },
          }}
          sx={{ width: { xs: '100%', sm: 320 } }}
        />
        <TextField
          select
          size="small"
          value={includeArchived ? 'all' : 'active'}
          onChange={(event) =>
            setIncludeArchived(event.target.value === 'all')
          }
          label="Vista"
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="active">Solo activos</MenuItem>
          <MenuItem value="all">Incluir archivados</MenuItem>
        </TextField>
        <span className="ml-auto text-xs text-text-muted">
          {projects.length} proyectos
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {projects.map((project) => (
          <article className="workspace-card rounded-lg p-5" key={project.id}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase text-text-muted">
                  {project.status}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{project.name}</h2>
              </div>
              <span
                className={`h-2.5 w-2.5 rounded-full ${project.archivedAt ? 'bg-zinc-400' : 'bg-emerald-500'}`}
              />
            </div>
            <p className="min-h-10 text-sm text-text-secondary">
              {project.description || 'Sin descripción.'}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <Button
                component={Link}
                to={`/projects/${project.id}`}
                size="small"
                endIcon={<ArrowForwardRounded />}
              >
                Abrir
              </Button>
              {!project.archivedAt ? (
                <PermissionAction
                  permission="projects.archive"
                  startIcon={<ArchiveRounded />}
                  onClick={() => void handleArchive(project)}
                >
                  {archiveState.loading ? 'Archivando' : 'Archivar'}
                </PermissionAction>
              ) : null}
              <PermissionAction
                permission="projects.delete"
                startIcon={<DeleteOutlineRounded />}
                onClick={() => setConfirmProject(project)}
              >
                Eliminar
              </PermissionAction>
            </div>
          </article>
        ))}
      </div>

      {!projects.length && !projectsQuery.loading ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-text-muted">
          No hay proyectos para mostrar.
        </div>
      ) : null}

      <FormDialog
        open={dialogOpen}
        onClose={closeDialog}
        title="Nuevo proyecto"
        subtitle="El usuario actual quedará registrado como propietario."
        actions={
          <>
            <Button onClick={closeDialog}>Cancelar</Button>
            <Button
              variant="contained"
              disabled={!name.trim() || !user?.id || createState.loading}
              onClick={() => void handleCreate()}
            >
              Crear proyecto
            </Button>
          </>
        }
      >
        <TextField
          autoFocus
          label="Nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          label="Descripción"
          multiline
          minRows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </FormDialog>

      <ConfirmDialog
        open={Boolean(confirmProject)}
        title="Eliminar proyecto"
        description={`Se eliminará ${confirmProject?.name ?? ''}. Esta acción no se puede deshacer.`}
        onClose={() => setConfirmProject(null)}
        onConfirm={() => void handleDelete()}
        destructive
        loading={deleteState.loading}
      />
    </div>
  );
};

export default ProjectsPageContent;
