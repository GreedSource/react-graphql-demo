import * as React from 'react';
import { BusinessRounded, ContactPageRounded, EventRounded, PaidRounded, TrendingUpRounded } from '@mui/icons-material';
import { Alert, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { AnalyticsBarChart } from '@/components/ui/AnalyticsBarChart';
import { MetricCard } from '@/components/ui/MetricCard';
import { OrganizationSelector } from '@/components/crm/OrganizationSelector';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { getApolloErrorMessage } from '@/lib/graphql';
import { useCrmDashboard, useCrmOrganization } from '@/hooks/crm.hook';

const CRMDashboardPage: React.FC = () => {
  const { organizationId, setOrganizationId } = useCrmOrganization();
  const dashboard = useCrmDashboard(organizationId);
  const summary = dashboard.data?.crmDashboard.data;
  const cards = [
    ['Empresas', summary?.companies ?? 0, <BusinessRounded />, 'accent'],
    ['Contactos', summary?.contacts ?? 0, <ContactPageRounded />, 'blue'],
    ['Leads', summary?.leads ?? 0, <TrendingUpRounded />, 'amber'],
    ['Oportunidades', summary?.opportunities ?? 0, <PaidRounded />, 'green'],
    ['Actividades', summary?.activities ?? 0, <EventRounded />, 'rose'],
  ] as const;
  const resourceData = [
    { label: 'Empresas', value: summary?.companies ?? 0, color: '#818cf8' },
    { label: 'Contactos', value: summary?.contacts ?? 0, color: '#38bdf8' },
    { label: 'Leads', value: summary?.leads ?? 0, color: '#fbbf24' },
    { label: 'Oportunidades', value: summary?.opportunities ?? 0, color: '#34d399' },
    { label: 'Actividades', value: summary?.activities ?? 0, color: '#fb7185' },
  ];

  return <div className="space-y-5">
    <PageHeader eyebrow="CRM" title="Dashboard comercial" description="Resumen autorizado de la organización seleccionada." actions={<OrganizationSelector value={organizationId} onChange={setOrganizationId} />} />
    {!organizationId ? <Alert severity="info" action={<Button component={Link} to="/crm/settings" color="inherit" size="small">Configurar CRM</Button>}>Crea o selecciona una organización para comenzar.</Alert> : null}
    {dashboard.error ? <Alert severity="error">{getApolloErrorMessage(dashboard.error)}</Alert> : null}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(([title, value, icon, tone]) => <MetricCard key={title} label={title} value={value} icon={icon} tone={tone} />)}
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <SectionCard title="Distribución comercial" description="Volumen actual por tipo de registro. Usa esta lectura para decidir dónde enfocar el siguiente seguimiento." icon={<TrendingUpRounded />}>
        <AnalyticsBarChart data={resourceData} emptyLabel="Selecciona una organización para cargar la analítica comercial." />
      </SectionCard>
      <SectionCard title="Pipeline abierto" description="Valor agregado de oportunidades aún no cerradas." icon={<PaidRounded />}>
        <p className="text-4xl font-semibold tracking-tight text-accent">${Number(summary?.pipelineValue ?? 0).toLocaleString()}</p>
        <div className="mt-5 rounded-xl bg-accent-soft p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">Siguiente paso</p>
          <p className="mt-1 text-sm leading-5 text-text-secondary">Revisa oportunidades y actividades para mantener actualizado el pipeline.</p>
          <Button component={Link} to="/crm/opportunities" size="small" sx={{ mt: 1.5 }}>Ver oportunidades</Button>
        </div>
      </SectionCard>
    </div>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Button component={Link} to="/crm/companies" variant="outlined" startIcon={<BusinessRounded />} className="!justify-start !px-4">Administrar empresas</Button>
      <Button component={Link} to="/crm/contacts" variant="outlined" startIcon={<ContactPageRounded />} className="!justify-start !px-4">Revisar contactos</Button>
      <Button component={Link} to="/crm/leads" variant="outlined" startIcon={<TrendingUpRounded />} className="!justify-start !px-4">Calificar leads</Button>
      <Button component={Link} to="/crm/activities" variant="outlined" startIcon={<EventRounded />} className="!justify-start !px-4">Registrar actividad</Button>
    </section>
  </div>;
};

export default CRMDashboardPage;
