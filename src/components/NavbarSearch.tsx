import type * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import SearchRounded from '@mui/icons-material/SearchRounded';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/project.hook';
import { useTasks } from '@/hooks/task.hook';

interface NavbarSearchProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

interface SearchResult {
  id: string;
  label: string;
  meta: string;
  to: string;
}

const NavbarSearch: React.FC<NavbarSearchProps> = ({
  open,
  onClose,
  onOpen,
}) => {
  const navigate = useNavigate();
  const projectsQuery = useProjects();
  const tasksQuery = useTasks();
  const [query, setQuery] = useState('');
  const projects = projectsQuery.data?.projects?.data;
  const tasks = tasksQuery.data?.tasks?.data;

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpen();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [onOpen]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const availableProjects = projects ?? [];
    const availableTasks = tasks ?? [];
    const projectResults = availableProjects.map((project) => ({
      id: project.id,
      label: project.name,
      meta: project.description || project.status,
      to: `/projects/${project.id}`,
    }));
    const taskResults = availableTasks.map((task) => ({
      id: task.id,
      label: task.title,
      meta: availableProjects.find((project) => project.id === task.projectId)?.name
        ?? 'Proyecto',
      to: '/tasks',
    }));
    const normalizedQuery = query.toLowerCase();

    return [...projectResults, ...taskResults].filter((item) =>
      `${item.label} ${item.meta}`.toLowerCase().includes(normalizedQuery),
    );
  }, [projects, query, tasks]);

  const openResult = (result: SearchResult) => {
    onClose();
    setQuery('');
    navigate(result.to);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { position: 'fixed', top: { xs: 76, sm: 88 }, m: 0, borderRadius: 3 },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <TextField
          autoFocus
          fullWidth
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busca proyectos o tareas..."
          variant="standard"
          slotProps={{
            input: {
              disableUnderline: true,
              startAdornment: (
                <SearchRounded className="mx-4 text-text-muted" />
              ),
            },
          }}
          sx={{ p: 1 }}
        />
        <div className="max-h-80 overflow-y-auto border-t border-border p-2">
          {searchResults.map((result) => (
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left hover:bg-surface-elevated"
              key={`${result.to}-${result.id}`}
              onClick={() => openResult(result)}
            >
              <span>
                <span className="block text-sm font-medium">
                  {result.label}
                </span>
                <span className="block text-xs text-text-muted">
                  {result.meta}
                </span>
              </span>
              <span className="text-xs text-text-muted">Abrir</span>
            </button>
          ))}
          {searchResults.length === 0 ? (
            <p className="p-6 text-center text-sm text-text-muted">
              No se encontraron resultados.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NavbarSearch;
