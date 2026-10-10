import * as React from 'react';
import DataObjectRounded from '@mui/icons-material/DataObjectRounded';
import DownloadRounded from '@mui/icons-material/DownloadRounded';
import IosShareRounded from '@mui/icons-material/IosShareRounded';
import PictureAsPdfRounded from '@mui/icons-material/PictureAsPdfRounded';
import TableViewRounded from '@mui/icons-material/TableViewRounded';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { toast } from 'react-toastify';

export interface AnalyticsExportRow {
  [key: string]: string | number | boolean | null;
}

interface AnalyticsExportMenuProps {
  targetRef: React.RefObject<HTMLElement | null>;
  filename: string;
  title: string;
  rows: AnalyticsExportRow[];
  shareText: string;
}

const fileNameForDownload = (filename: string, extension: string) => {
  const safeName = filename.trim().replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'reporte';
  return `${safeName}.${extension}`;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const toCsv = (rows: AnalyticsExportRow[]) => {
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const escapeValue = (value: AnalyticsExportRow[string]) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  return [
    headers.map(escapeValue).join(','),
    ...rows.map((row) => headers.map((header) => escapeValue(row[header])).join(',')),
  ].join('\n');
};

const getCardBackground = (element: HTMLElement) => {
  const background = window.getComputedStyle(element).backgroundColor;
  return background === 'rgba(0, 0, 0, 0)' ? '#ffffff' : background;
};

const captureCard = async (targetRef: React.RefObject<HTMLElement | null>) => {
  const target = targetRef.current;
  if (!target) throw new Error('No se encontró el card para exportar.');

  const { toBlob } = await import('html-to-image');
  const blob = await toBlob(target, {
    backgroundColor: getCardBackground(target),
    cacheBust: true,
    pixelRatio: 2,
  });

  if (!blob) throw new Error('No se pudo generar la imagen del card.');
  return blob;
};

const printCard = (targetRef: React.RefObject<HTMLElement | null>) => {
  const target = targetRef.current;
  if (!target) throw new Error('No se encontró el card para imprimir.');

  const printTarget = target.cloneNode(true) as HTMLElement;
  printTarget.classList.add('analytics-print-target');
  printTarget.setAttribute('aria-hidden', 'true');

  const cleanup = () => {
    printTarget.remove();
    document.body.classList.remove('analytics-printing-card');
  };

  document.body.appendChild(printTarget);
  document.body.classList.add('analytics-printing-card');
  window.addEventListener('afterprint', cleanup, { once: true });
  try {
    window.print();
  } catch (error) {
    cleanup();
    throw error;
  }
};

const AnalyticsExportMenu: React.FC<AnalyticsExportMenuProps> = ({
  targetRef,
  filename,
  title,
  rows,
  shareText,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isBusy, setIsBusy] = React.useState(false);
  const isOpen = Boolean(anchorEl);

  const runAction = async (action: () => Promise<void> | void) => {
    setAnchorEl(null);
    setIsBusy(true);
    try {
      await action();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      toast.error(error instanceof Error ? error.message : 'No se pudo completar la exportación.');
    } finally {
      setIsBusy(false);
    }
  };

  const exportPng = async () => {
    const blob = await captureCard(targetRef);
    downloadBlob(blob, fileNameForDownload(filename, 'png'));
    toast.success('PNG descargado.');
  };

  const exportCsv = () => {
    if (!rows.length) throw new Error('No hay datos para exportar.');
    const blob = new Blob([`\uFEFF${toCsv(rows)}`], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, fileNameForDownload(filename, 'csv'));
    toast.success('CSV descargado.');
  };

  const exportJson = () => {
    if (!rows.length) throw new Error('No hay datos para exportar.');
    const blob = new Blob([JSON.stringify({ title, exportedAt: new Date().toISOString(), data: rows }, null, 2)], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, fileNameForDownload(filename, 'json'));
    toast.success('JSON descargado.');
  };

  const shareReport = async () => {
    const text = `${shareText}\n\n${window.location.href}`;

    if (navigator.share) {
      let shareData: ShareData = { title, text, url: window.location.href };
      try {
        const blob = await captureCard(targetRef);
        const file = new File([blob], fileNameForDownload(filename, 'png'), { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          shareData = { title, text: shareText, files: [file] };
        }
      } catch {
        // Compartir texto sigue siendo válido aunque la captura no esté disponible.
      }
      await navigator.share(shareData);
      return;
    }

    if (!navigator.clipboard?.writeText) throw new Error('Este navegador no ofrece compartir ni copiar al portapapeles.');
    await navigator.clipboard.writeText(text);
    toast.success('Resumen copiado al portapapeles.');
  };

  return (
    <>
      <Button
        aria-expanded={isOpen ? 'true' : undefined}
        aria-haspopup="menu"
        data-analytics-export-control="true"
        disabled={isBusy}
        size="small"
        startIcon={isBusy ? <CircularProgress size={16} /> : <DownloadRounded />}
        variant="outlined"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        Exportar
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => void runAction(exportPng)}>
          <ListItemIcon><DownloadRounded fontSize="small" /></ListItemIcon>
          <ListItemText primary="Descargar PNG" secondary="Imagen del card" />
        </MenuItem>
        <MenuItem onClick={() => void runAction(exportCsv)}>
          <ListItemIcon><TableViewRounded fontSize="small" /></ListItemIcon>
          <ListItemText primary="Descargar CSV" secondary="Datos para hojas de cálculo" />
        </MenuItem>
        <MenuItem onClick={() => void runAction(exportJson)}>
          <ListItemIcon><DataObjectRounded fontSize="small" /></ListItemIcon>
          <ListItemText primary="Descargar JSON" secondary="Datos completos del card" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => void runAction(shareReport)}>
          <ListItemIcon><IosShareRounded fontSize="small" /></ListItemIcon>
          <ListItemText primary="Compartir" secondary="Usa la opción nativa del dispositivo" />
        </MenuItem>
        <MenuItem onClick={() => void runAction(() => printCard(targetRef))}>
          <ListItemIcon><PictureAsPdfRounded fontSize="small" /></ListItemIcon>
          <ListItemText primary="Imprimir / guardar PDF" secondary="Abre el diálogo del sistema" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default AnalyticsExportMenu;
