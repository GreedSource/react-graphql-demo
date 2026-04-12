import { useMutation, useQuery } from '@apollo/client';
import { CREATE_ACTION } from '@/graphql/action/mutations';
import { ACTIONS } from '@/graphql/action/queries';
import { ensureSuccess } from '@/lib/graphql';
import type {
  ActionEntity,
  ApiResponse,
  CreateActionInput,
} from '@/types/admin';

interface ActionsQueryResult {
  actions: ApiResponse<ActionEntity[]>;
}

interface ActionMutationResult {
  createAction: ApiResponse<ActionEntity>;
}

export function useActions(skip = false) {
  return useQuery<ActionsQueryResult>(ACTIONS, {
    skip,
    fetchPolicy: 'cache-and-network',
  });
}

export function useActionMutations() {
  const [createActionMutation, createState] =
    useMutation<ActionMutationResult>(CREATE_ACTION);

  const createAction = async (input: CreateActionInput) => {
    const { data } = await createActionMutation({
      variables: { input },
      refetchQueries: [{ query: ACTIONS }],
      awaitRefetchQueries: true,
    });

    return ensureSuccess(data?.createAction, 'No se pudo crear la accion.');
  };

  return {
    createAction,
    createState,
  };
}
