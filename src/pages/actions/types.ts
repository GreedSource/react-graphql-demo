import type { CreateActionInput } from '@/types/admin';

export interface ActionsFormState {
  name: CreateActionInput['name'];
  key: CreateActionInput['key'];
  description: string;
  active: boolean;
}
