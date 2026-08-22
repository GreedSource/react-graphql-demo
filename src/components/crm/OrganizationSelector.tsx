import * as React from 'react';
import { TextField } from '@mui/material';
import { MenuItem } from '@mui/material';
import { useCrmOrganizations } from '@/hooks/crm.hook';

interface OrganizationSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({ value, onChange }) => {
  const query = useCrmOrganizations();
  const organizations = query.data?.crmOrganizations.data ?? [];
  return <TextField select label="Organización" value={value} onChange={(event) => onChange(event.target.value)} size="small" sx={{ minWidth: { xs: '100%', sm: 280 } }} helperText={query.error ? 'No se pudieron cargar las organizaciones' : undefined}>
    <MenuItem value=""><em>Seleccionar organización</em></MenuItem>
    {organizations.map((organization) => <MenuItem key={organization.id} value={organization.id}>{organization.name}</MenuItem>)}
  </TextField>;
};
