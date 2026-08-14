import { useMutation, useQuery } from '@apollo/client';
import { ASSIGN_TASK, COMPLETE_TASK, CREATE_TASK, DELETE_TASK, UPDATE_TASK } from '@/graphql/task/mutations';
import { TASK, TASKS } from '@/graphql/task/queries';
import { ensureSuccess } from '@/lib/graphql';
import type { ApiResponse } from '@/types/admin';
import type { CreateTaskInput, TaskEntity, UpdateTaskInput } from '@/types/project-platform';

interface TasksQueryResult {
  tasks: ApiResponse<TaskEntity[]>;
}

interface UpdateTaskResult {
  updateTask: ApiResponse<TaskEntity>;
  createTask: ApiResponse<TaskEntity>;
  assignTask: ApiResponse<TaskEntity>;
  completeTask: ApiResponse<TaskEntity>;
  deleteTask: ApiResponse<boolean>;
}

export function useTasks(projectId?: string) {
  return useQuery<TasksQueryResult>(TASKS, {
    variables: { projectId },
    fetchPolicy: 'cache-and-network',
  });
}

export function useTask(id?: string) { return useQuery<{ task: ApiResponse<TaskEntity> }>(TASK, { variables: { id }, skip: !id, fetchPolicy: 'cache-and-network' }); }

export function useTaskMutations() {
  const [updateTaskMutation, updateState] =
    useMutation<UpdateTaskResult>(UPDATE_TASK);
  const [createTaskMutation, createState] = useMutation<UpdateTaskResult>(CREATE_TASK);
  const [assignTaskMutation, assignState] = useMutation<UpdateTaskResult>(ASSIGN_TASK);
  const [completeTaskMutation, completeState] = useMutation<UpdateTaskResult>(COMPLETE_TASK);
  const [deleteTaskMutation, deleteState] = useMutation<UpdateTaskResult>(DELETE_TASK);
  const refresh = [{ query: TASKS }];

  const updateTask = async (input: UpdateTaskInput) => {
    const { data } = await updateTaskMutation({
      variables: { input },
      refetchQueries: [{ query: TASKS, variables: {} }],
      awaitRefetchQueries: true,
    });

    return ensureSuccess(data?.updateTask, 'No se pudo actualizar la tarea.');
  };

  const createTask = async (input: CreateTaskInput) => ensureSuccess((await createTaskMutation({ variables: { input }, refetchQueries: refresh, awaitRefetchQueries: true })).data?.createTask, 'No se pudo crear la tarea.');
  const assignTask = async (id: string, assigneeId: string) => ensureSuccess((await assignTaskMutation({ variables: { id, assigneeId }, refetchQueries: refresh, awaitRefetchQueries: true })).data?.assignTask, 'No se pudo asignar la tarea.');
  const completeTask = async (id: string) => ensureSuccess((await completeTaskMutation({ variables: { id }, refetchQueries: refresh, awaitRefetchQueries: true })).data?.completeTask, 'No se pudo completar la tarea.');
  const deleteTask = async (id: string) => ensureSuccess((await deleteTaskMutation({ variables: { id }, refetchQueries: refresh, awaitRefetchQueries: true })).data?.deleteTask, 'No se pudo eliminar la tarea.');

  return { createTask, updateTask, assignTask, completeTask, deleteTask, createState, updateState, assignState, completeState, deleteState };
}
