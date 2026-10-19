import type * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import type { CRMModule } from '@/types/crm';

interface CRMResourceFormFieldsProps {
  module: CRMModule;
  form: Record<string, string>;
  setField: (field: string, value: string) => void;
}

export const CRMResourceFormFields: React.FC<CRMResourceFormFieldsProps> = ({
  module,
  form,
  setField,
}) => (
  <>
    {module !== 'activities' ? (
      <TextField
        autoFocus
        label="Nombre"
        value={form.name ?? ''}
        onChange={(event) => setField('name', event.target.value)}
      />
    ) : null}
    {module === 'contacts' ? (
      <>
        <TextField
          label="Apellido"
          value={form.lastname ?? ''}
          onChange={(event) => setField('lastname', event.target.value)}
        />
        <TextField
          label="Cargo"
          value={form.position ?? ''}
          onChange={(event) => setField('position', event.target.value)}
        />
      </>
    ) : null}
    {module === 'companies' ? (
      <>
        <TextField
          label="Industria"
          value={form.industry ?? ''}
          onChange={(event) => setField('industry', event.target.value)}
        />
        <TextField
          label="Sitio web"
          value={form.website ?? ''}
          onChange={(event) => setField('website', event.target.value)}
        />
        <TextField
          label="Dirección"
          value={form.address ?? ''}
          onChange={(event) => setField('address', event.target.value)}
        />
      </>
    ) : null}
    {module !== 'activities' &&
    module !== 'leads' &&
    module !== 'opportunities' ? (
      <>
        <TextField
          label="Email"
          type="email"
          value={form.email ?? ''}
          onChange={(event) => setField('email', event.target.value)}
        />
        <TextField
          label="Teléfono"
          value={form.phone ?? ''}
          onChange={(event) => setField('phone', event.target.value)}
        />
      </>
    ) : null}
    {module === 'leads' ? (
      <>
        <TextField
          label="Origen"
          value={form.source ?? ''}
          onChange={(event) => setField('source', event.target.value)}
        />
        <TextField
          label="Score"
          type="number"
          value={form.score ?? '0'}
          onChange={(event) => setField('score', event.target.value)}
        />
        <TextField
          select
          label="Estado"
          value={form.status ?? 'new'}
          onChange={(event) => setField('status', event.target.value)}
        >
          <MenuItem value="new">Nuevo</MenuItem>
          <MenuItem value="contacted">Contactado</MenuItem>
          <MenuItem value="qualified">Calificado</MenuItem>
          <MenuItem value="lost">Perdido</MenuItem>
        </TextField>
      </>
    ) : null}
    {module === 'opportunities' ? (
      <>
        <TextField
          label="Valor"
          type="number"
          value={form.value ?? '0'}
          onChange={(event) => setField('value', event.target.value)}
        />
        <TextField
          label="Probabilidad"
          type="number"
          value={form.probability ?? '0'}
          onChange={(event) => setField('probability', event.target.value)}
        />
        <TextField
          select
          label="Etapa"
          value={form.stage ?? 'qualified'}
          onChange={(event) => setField('stage', event.target.value)}
        >
          <MenuItem value="qualified">Calificada</MenuItem>
          <MenuItem value="proposal">Propuesta</MenuItem>
          <MenuItem value="negotiation">Negociación</MenuItem>
          <MenuItem value="won">Ganada</MenuItem>
          <MenuItem value="lost">Perdida</MenuItem>
        </TextField>
        <TextField
          label="Cierre esperado"
          type="datetime-local"
          value={form.expectedCloseDate ?? ''}
          onChange={(event) =>
            setField('expectedCloseDate', event.target.value)
          }
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </>
    ) : null}
    {module === 'activities' ? (
      <>
        <TextField
          autoFocus
          label="Asunto"
          value={form.subject ?? ''}
          onChange={(event) => setField('subject', event.target.value)}
        />
        <TextField
          select
          label="Tipo"
          value={form.activityType ?? 'note'}
          onChange={(event) => setField('activityType', event.target.value)}
        >
          <MenuItem value="call">Llamada</MenuItem>
          <MenuItem value="email">Email</MenuItem>
          <MenuItem value="meeting">Reunión</MenuItem>
          <MenuItem value="note">Nota</MenuItem>
          <MenuItem value="task">Tarea</MenuItem>
          <MenuItem value="follow_up">Seguimiento</MenuItem>
        </TextField>
        <TextField
          multiline
          minRows={3}
          label="Descripción"
          value={form.description ?? ''}
          onChange={(event) => setField('description', event.target.value)}
        />
        <TextField
          label="Programada para"
          type="datetime-local"
          value={form.scheduledAt ?? ''}
          onChange={(event) => setField('scheduledAt', event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </>
    ) : null}
  </>
);
