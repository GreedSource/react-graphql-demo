import type * as React from 'react';
import { Button } from '@mui/material';
import { StateCard } from '@/components/ui/StateCard';
import { StatusChip } from '@/components/ui/StatusChip';
import type { ModuleDetailPanelProps } from '../types';

const ModuleDetailPanel: React.FC<ModuleDetailPanelProps> = ({
  selectedModule,
  onEdit,
}) => {
  if (!selectedModule) {
    return (
      <StateCard
        title="Sin selección"
        description="Selecciona un módulo de la tabla."
      />
    );
  }

  return (
    <div className="space-y-4 text-sm text-text-secondary">
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-semibold text-text">
          {selectedModule.name}
        </h3>
        <StatusChip active={selectedModule.active} />
      </div>
      <p>
        <span className="font-semibold text-text">Key:</span>{' '}
        {selectedModule.key}
      </p>
      <p>
        {selectedModule.description || 'Sin descripción para este módulo.'}
      </p>
      <Button variant="contained" onClick={onEdit}>
        Editar módulo
      </Button>
    </div>
  );
};

export default ModuleDetailPanel;
