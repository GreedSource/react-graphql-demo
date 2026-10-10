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

export interface UserEditFormState {
  id: string;
  name: string;
  lastname: string;
  email: string;
  roleId: string;
  roleName: string;
}

export interface UserDetailPanelProps {
  selectedUser: UserSummary | undefined;
  onEdit: () => void;
  onDelete: () => void;
}

export interface UserFormFieldsProps {
  formState: UserEditFormState;
  formErrors: Partial<Record<'name' | 'lastname', string>>;
  roles: UserRoleOption[];
  roleDisabled: boolean;
  roleHelperText: string;
  onChange: (state: UserEditFormState) => void;
}
