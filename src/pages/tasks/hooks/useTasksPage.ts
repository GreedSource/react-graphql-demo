import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useProjects } from '@/hooks/project.hook';
import { useTaskMutations, useTasks } from '@/hooks/task.hook';
import { useUsers } from '@/hooks/user.hook';
import { getApolloErrorMessage } from '@/lib/graphql';
import { usePermission } from '@/lib/permissions';
import { taskStatusLabels } from '@/lib/project-platform-labels';
import type { ProjectTask, TaskStatus } from '@/types/project-platform';

export const useTasksPage = () => {
  const { can } = usePermission();
  const tasksQuery = useTasks();
  const projectsQuery = useProjects();
  const usersQuery = useUsers();
  const {
    createTask: persistNewTask,
    updateTask: persistTask,
    assignTask,
    completeTask,
    deleteTask,
    createState,
    updateState,
  } = useTaskMutations();
  const [taskList, setTaskList] = useState<ProjectTask[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [projectId, setProjectId] = useState('all');
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [dialogOpen, setDialogOpen] = useState(searchParams.get('create') === '1');
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [newProjectId, setNewProjectId] = useState(searchParams.get('projectId') ?? '');
  const [newStatus, setNewStatus] = useState<TaskStatus>('todo');
  const apiProjects = useMemo(() => projectsQuery.data?.projects?.data ?? [], [projectsQuery.data]);
  const users = usersQuery.data?.users?.data ?? [];
  const projectName = (id: string) => apiProjects.find((project) => project.id === id)?.name ?? 'Proyecto';
  const filteredTasks = taskList.filter(
    (task) => task.title.toLowerCase().includes(query.toLowerCase()) && (projectId === 'all' || task.projectId === projectId),
  );

  useEffect(() => {
    const backendTasks = tasksQuery.data?.tasks?.data;
    if (!backendTasks) return;
    setTaskList(backendTasks.map((task) => ({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      status: task.status,
      priority: task.priority,
      assignee: task.assigneeId || 'Sin asignar',
      dueDate: task.dueDate || '',
    })));
  }, [tasksQuery.data]);

  useEffect(() => {
    if (apiProjects.length && !apiProjects.some((project) => project.id === newProjectId)) {
      setNewProjectId(apiProjects[0].id);
    }
  }, [apiProjects, newProjectId]);

  const closeCreate = () => {
    setDialogOpen(false);
    setSearchParams({}, { replace: true });
  };

  const openCreate = (status: TaskStatus = 'todo') => {
    setNewStatus(status);
    setDialogOpen(true);
  };

  const createTask = async () => {
    if (!title.trim() || !assignee.trim() || !newProjectId) return;
    try {
      const response = await persistNewTask({
        projectId: newProjectId,
        title: title.trim(),
        assigneeId: assignee,
        status: newStatus,
        priority: 'medium',
      });
      setTitle('');
      setAssignee('');
      closeCreate();
      toast.success(response.message || 'Tarea creada correctamente');
    } catch (error) {
      toast.error(getApolloErrorMessage(error));
    }
  };

  const updateTask = async () => {
    if (!selectedTask?.title.trim() || !selectedTask.assignee.trim()) return;
    const previousTask = taskList.find((task) => task.id === selectedTask.id);
    setTaskList((current) => current.map((task) => task.id === selectedTask.id ? selectedTask : task));
    setSelectedTask(null);
    try {
      const response = await persistTask({
        id: selectedTask.id,
        projectId: selectedTask.projectId,
        title: selectedTask.title,
        status: selectedTask.status,
        priority: selectedTask.priority,
        dueDate: selectedTask.dueDate || null,
      });
      if (previousTask && previousTask.assignee !== selectedTask.assignee) {
        await assignTask(selectedTask.id, selectedTask.assignee);
      }
      toast.success(response.message || 'Tarea actualizada correctamente');
    } catch (error) {
      if (previousTask) {
        setTaskList((current) => current.map((task) => task.id === previousTask.id ? previousTask : task));
      }
      toast.error(getApolloErrorMessage(error));
    }
  };

  const moveTask = async (taskId: string, status: TaskStatus) => {
    if (!can('tasks.update')) return;
    const task = taskList.find((item) => item.id === taskId);
    if (!task || task.status === status) {
      setDraggedTaskId(null);
      setDragOverStatus(null);
      return;
    }
    setTaskList((current) => current.map((item) => item.id === taskId ? { ...item, status } : item));
    setDraggedTaskId(null);
    setDragOverStatus(null);
    try {
      const response = await persistTask({ id: taskId, status });
      toast.success(response.message || `Tarea movida a ${taskStatusLabels[status]}`);
    } catch (error) {
      setTaskList((current) => current.map((item) => item.id === taskId ? task : item));
      toast.error(getApolloErrorMessage(error));
    }
  };

  return {
    can, tasksQuery, users, query, setQuery, projectId, setProjectId, view, setView,
    dialogOpen, selectedTask, setSelectedTask, draggedTaskId, setDraggedTaskId,
    dragOverStatus, setDragOverStatus, title, setTitle, assignee, setAssignee,
    newProjectId, setNewProjectId, newStatus, apiProjects, projectName, filteredTasks,
    closeCreate, openCreate, createTask, updateTask, moveTask, completeTask, deleteTask,
    createState, updateState,
  };
};
