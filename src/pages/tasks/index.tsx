import * as React from 'react';
import { AddRounded, SearchRounded, ViewKanbanRounded, ViewListRounded } from '@mui/icons-material';
import { Alert, Button, IconButton, MenuItem, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionAction } from '@/components/project-platform/PermissionAction';
import { priorityLabels, taskStatusLabels } from '@/lib/project-platform-labels';
import type { TaskPriority, TaskStatus } from '@/types/project-platform';
import { FormDialog } from '@/components/ui/FormDialog';
import { getApolloErrorMessage } from '@/lib/graphql';
import TaskCard from './components/TaskCard';
import { useTasksPage } from './hooks/useTasksPage';

const columns: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done'];

const TasksPageContent: React.FC = () => {
  const {
    can, tasksQuery, users, query, setQuery, projectId, setProjectId, view, setView,
    dialogOpen, selectedTask, setSelectedTask, draggedTaskId, setDraggedTaskId,
    dragOverStatus, setDragOverStatus, title, setTitle, assignee, setAssignee,
    newProjectId, setNewProjectId, newStatus, apiProjects, projectName, filteredTasks,
    closeCreate, openCreate, createTask, updateTask, moveTask, completeTask, deleteTask,
    createState, updateState,
  } = useTasksPage();

  return (
  <div className="space-y-5">
    <PageHeader eyebrow="Trabajo" title="Tablero de tareas" description="Organiza el trabajo por estado y detecta bloqueos antes de que afecten una entrega." actions={<PermissionAction permission="tasks.create" variant="contained" startIcon={<AddRounded />} onClick={() => openCreate()}>Crear tarea</PermissionAction>} />

    {tasksQuery.error ? <Alert severity="error">{getApolloErrorMessage(tasksQuery.error)}</Alert> : null}

    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-card p-3 lg:flex-row lg:items-center">
      <TextField value={query} onChange={(event) => setQuery(event.target.value)} size="small" placeholder="Buscar en el tablero" slotProps={{ input: { startAdornment: <SearchRounded className="mr-2 text-text-muted" fontSize="small" /> } }} sx={{ width: { xs: '100%', lg: 320 } }} />
      <TextField select size="small" value={projectId} onChange={(event) => setProjectId(event.target.value)} label="Proyecto" sx={{ minWidth: 190 }}><MenuItem value="all">Todos los proyectos</MenuItem>{apiProjects.map((project) => <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>)}</TextField>
      <Button onClick={() => { setQuery(''); setProjectId('all'); }} sx={{ ml: { lg: 'auto' } }}>Limpiar</Button>
      <Button onClick={() => setView((current) => current === 'kanban' ? 'list' : 'kanban')} variant="outlined" startIcon={view === 'kanban' ? <ViewListRounded /> : <ViewKanbanRounded />}>{view === 'kanban' ? 'Lista' : 'Kanban'}</Button>
    </div>

    {view === 'kanban' ? <div className="grid items-start gap-4 overflow-x-auto pb-3 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((status) => {
        const columnTasks = filteredTasks.filter((task) => task.status === status);
        return (
          <section
            className={`min-w-[270px] rounded-lg border p-3 transition-colors ${dragOverStatus === status ? 'border-accent bg-accent-soft' : 'border-transparent bg-surface-elevated'}`}
            key={status}
            onDragOver={(event) => { if (!can('tasks.update')) return; event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDragOverStatus(status); }}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOverStatus(null); }}
            onDrop={(event) => { event.preventDefault(); moveTask(event.dataTransfer.getData('text/plain') || draggedTaskId || '', status); }}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${status === 'blocked' ? 'bg-red-500' : status === 'done' ? 'bg-emerald-500' : status === 'in_progress' ? 'bg-sky-500' : 'bg-zinc-400'}`} /><h2 className="text-xs font-bold uppercase text-text-secondary">{taskStatusLabels[status]}</h2><span className="rounded bg-surface-card px-1.5 text-xs text-text-muted">{columnTasks.length}</span></div>
              <IconButton aria-label={`Agregar a ${taskStatusLabels[status]}`} onClick={() => openCreate(status)} size="small"><AddRounded fontSize="small" /></IconButton>
            </div>
            <div className="space-y-3">{columnTasks.map((task) => <TaskCard key={task.id} task={task} projectName={projectName(task.projectId)} onOpen={setSelectedTask} draggable={can('tasks.update')} onDragStart={setDraggedTaskId} onDragEnd={() => { setDraggedTaskId(null); setDragOverStatus(null); }} />)}{columnTasks.length === 0 ? <div className={`rounded-md border border-dashed p-6 text-center text-xs ${dragOverStatus === status ? 'border-accent text-accent' : 'border-border text-text-muted'}`}>{draggedTaskId ? 'Soltar aquí' : 'Sin tareas'}</div> : null}</div>
          </section>
        );
      })}
    </div> : <div className="workspace-card overflow-hidden rounded-lg divide-y divide-border">{filteredTasks.map((task) => <button className="grid w-full gap-2 p-4 text-left hover:bg-surface-elevated sm:grid-cols-[1fr_180px_130px] sm:items-center" key={task.id} onClick={() => setSelectedTask(task)}><div><p className="text-sm font-semibold">{task.title}</p><p className="text-xs text-text-muted">{projectName(task.projectId)}</p></div><span className="text-sm text-text-secondary">{users.find((user) => user.id === task.assignee)?.name ?? task.assignee}</span><span className="text-xs text-text-muted">Vence {task.dueDate || 'Sin fecha'}</span></button>)}</div>}

    <FormDialog open={dialogOpen} onClose={closeCreate} title="Nueva tarea" subtitle={`Se agregará a ${taskStatusLabels[newStatus]}.`} actions={<><Button onClick={closeCreate}>Cancelar</Button><Button variant="contained" disabled={!title.trim() || !assignee.trim() || createState.loading} onClick={() => void createTask()}>Crear tarea</Button></>}>
      <TextField autoFocus label="Título" value={title} onChange={(event) => setTitle(event.target.value)} />
      <TextField select label="Proyecto" value={newProjectId} onChange={(event) => setNewProjectId(event.target.value)}>{apiProjects.map((project) => <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>)}</TextField>
      <TextField select label="Responsable" value={assignee} onChange={(event) => setAssignee(event.target.value)}>{users.map((user) => <MenuItem key={user.id} value={user.id}>{user.name} {user.lastname}</MenuItem>)}</TextField>
    </FormDialog>

    <FormDialog open={Boolean(selectedTask)} onClose={() => setSelectedTask(null)} title="Editar tarea" subtitle={selectedTask ? `Actualiza la tarea de ${projectName(selectedTask.projectId)}.` : undefined} actions={<><PermissionAction permission="tasks.delete" onClick={async () => { if (!selectedTask) return; try { await deleteTask(selectedTask.id); setSelectedTask(null); toast.success('Tarea eliminada'); } catch (error) { toast.error(getApolloErrorMessage(error)); } }}>Eliminar</PermissionAction><Button onClick={() => setSelectedTask(null)}>Cancelar</Button>{selectedTask?.status !== 'done' ? <PermissionAction permission="tasks.complete" onClick={async () => { if (!selectedTask) return; try { await completeTask(selectedTask.id); setSelectedTask(null); toast.success('Tarea completada'); } catch (error) { toast.error(getApolloErrorMessage(error)); } }}>Completar</PermissionAction> : null}<PermissionAction permission="tasks.update" variant="contained" onClick={() => void updateTask()}>{updateState.loading ? 'Guardando...' : 'Guardar cambios'}</PermissionAction></>}>
      {selectedTask ? <>
        <TextField autoFocus label="Título" value={selectedTask.title} onChange={(event) => setSelectedTask({ ...selectedTask, title: event.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField select label="Proyecto" value={selectedTask.projectId} onChange={(event) => setSelectedTask({ ...selectedTask, projectId: event.target.value })}>{apiProjects.map((project) => <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>)}</TextField>
          <TextField select label="Responsable" value={selectedTask.assignee} onChange={(event) => setSelectedTask({ ...selectedTask, assignee: event.target.value })}>{users.map((user) => <MenuItem key={user.id} value={user.id}>{user.name} {user.lastname}</MenuItem>)}</TextField>
          <TextField select label="Estado" value={selectedTask.status} onChange={(event) => setSelectedTask({ ...selectedTask, status: event.target.value as TaskStatus })}>{Object.entries(taskStatusLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
          <TextField select label="Prioridad" value={selectedTask.priority} onChange={(event) => setSelectedTask({ ...selectedTask, priority: event.target.value as TaskPriority })}>{Object.entries(priorityLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
        </div>
        <TextField label="Fecha límite" type="date" value={selectedTask.dueDate} onChange={(event) => setSelectedTask({ ...selectedTask, dueDate: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
        {selectedTask.status === 'blocked' ? <TextField label="Motivo del bloqueo" multiline minRows={2} value={selectedTask.blockedReason ?? ''} onChange={(event) => setSelectedTask({ ...selectedTask, blockedReason: event.target.value })} /> : null}
      </> : null}
    </FormDialog>
  </div>
  );
};

export default TasksPageContent;
