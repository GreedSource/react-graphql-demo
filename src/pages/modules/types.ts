import type { CreateModuleInput } from '@/types/admin';

export interface ModuleSummary {
  id: string;
  name: string;
  key: string;
  active: boolean;
  description?: string | null;
}

export interface ModuleDetailPanelProps {
  selectedModule: ModuleSummary | undefined;
  onEdit: () => void;
}

export interface ModuleFormFieldsProps {
  formState: CreateModuleInput & { id?: string };
  dialogMode: 'create' | 'edit';
  onChange: (state: CreateModuleInput & { id?: string }) => void;
}
