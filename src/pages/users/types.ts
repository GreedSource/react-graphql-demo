import type { UpdateUserInput } from '@/types/admin';

export interface UserSummary {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role?: { name: string } | null;
}

export interface UserRoleOption {
  id: string;
  name: string;
}

export interface UserDetailPanelProps {
  selectedUser: UserSummary | undefined;
  onEdit: () => void;
  onDelete: () => void;
}

export interface UserFormFieldsProps {
  formState: UpdateUserInput;
  formErrors: Partial<Record<'name' | 'lastname', string>>;
  roles: UserRoleOption[];
  onChange: (state: UpdateUserInput) => void;
}
