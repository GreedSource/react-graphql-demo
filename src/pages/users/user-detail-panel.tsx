import { Button } from '@mui/material';
import { StateCard } from '@/components/ui/StateCard';

interface UserDetailPanelProps {
  selectedUser:
    | {
        id: string;
        name: string;
        lastname: string;
        email: string;
        role?: { name: string } | null;
      }
    | undefined;
  onEdit: () => void;
  onDelete: () => void;
}

export default function UserDetailPanel({
  selectedUser,
  onEdit,
  onDelete,
}: UserDetailPanelProps) {
  if (!selectedUser) {
    return (
      <StateCard
        title="Sin seleccion"
        description="Elige un usuario en la tabla para abrir su detalle."
      />
    );
  }

  return (
    <div className="space-y-4 text-sm text-text-secondary">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          Nombre completo
        </p>
        <p className="mt-1 text-lg font-semibold text-text">
          {selectedUser.name} {selectedUser.lastname}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          Correo
        </p>
        <p className="mt-1">{selectedUser.email}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          Rol actual
        </p>
        <p className="mt-1">
          {selectedUser.role?.name || 'Sin rol asignado'}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="contained" onClick={onEdit}>
          Editar
        </Button>
        <Button color="error" variant="outlined" onClick={onDelete}>
          Eliminar
        </Button>
      </div>
    </div>
  );
}
