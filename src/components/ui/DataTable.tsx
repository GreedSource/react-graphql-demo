import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  hideOnMobile?: boolean;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  selectedRowKey?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchableFields?: ((item: T) => string)[];
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  enableRowSelection?: boolean;
  onSelectionChange?: (selectedKeys: Set<string>) => void;
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  selectedRowKey,
  emptyMessage = 'Sin registros',
  emptyDescription = 'No hay datos disponibles en este momento.',
  searchable = false,
  searchPlaceholder = 'Buscar...',
  searchableFields,
  rowsPerPageOptions = [5, 10, 25, 50],
  defaultRowsPerPage = 10,
  enableRowSelection = false,
  onSelectionChange,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const filteredRows = useMemo(() => {
    if (
      !searchQuery.trim() ||
      !searchableFields ||
      searchableFields.length === 0
    ) {
      return rows;
    }
    const query = searchQuery.toLowerCase();
    return rows.filter((row) =>
      searchableFields.some((getField) =>
        getField(row).toLowerCase().includes(query),
      ),
    );
  }, [rows, searchQuery, searchable, searchableFields]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAll = () => {
    if (selectedKeys.size === paginatedRows.length) {
      const newSelected = new Set(selectedKeys);
      paginatedRows.forEach((row) => newSelected.delete(getRowKey(row)));
      setSelectedKeys(newSelected);
      onSelectionChange?.(newSelected);
    } else {
      const newSelected = new Set(selectedKeys);
      paginatedRows.forEach((row) => newSelected.add(getRowKey(row)));
      setSelectedKeys(newSelected);
      onSelectionChange?.(newSelected);
    }
  };

  const handleSelectRow = (rowKey: string) => {
    const newSelected = new Set(selectedKeys);
    if (newSelected.has(rowKey)) {
      newSelected.delete(rowKey);
    } else {
      newSelected.add(rowKey);
    }
    setSelectedKeys(newSelected);
    onSelectionChange?.(newSelected);
  };

  const isAllSelected =
    paginatedRows.length > 0 && selectedKeys.size === paginatedRows.length;
  const isSomeSelected = selectedKeys.size > 0 && !isAllSelected;

  return (
    <div className="space-y-4">
      {searchable && (
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          fullWidth
          sx={(theme) => ({
            '& .MuiOutlinedInput-root': {
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(0,0,0,0.02)',
              borderRadius: 2,
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': {
                borderColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(0,0,0,0.15)',
              },
              '&.Mui-focused fieldset': {
                borderColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(56,189,248,0.5)'
                    : 'rgba(14,165,233,0.4)',
              },
            },
          })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'var(--text-muted)', fontSize: 18 }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery('')}
                  sx={{ color: 'var(--text-muted)' }}
                >
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      )}

      <Paper
        elevation={0}
        sx={{
          border: '1px solid var(--border-primary)',
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'var(--bg-card)',
          transition: 'box-shadow 200ms ease',
          '&:hover': {
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          },
        }}
      >
        <TableContainer sx={{ maxHeight: 'calc(100% - 52px)' }}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: 'var(--bg-secondary)',
                  '& .MuiTableCell-root': {
                    borderBottom: '1px solid var(--border-primary)',
                  },
                }}
              >
                {(enableRowSelection || searchable) && (
                  <TableCell padding="checkbox" sx={{ width: 48 }}>
                    {enableRowSelection && (
                      <Checkbox
                        indeterminate={isSomeSelected}
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        size="small"
                        sx={{
                          color: 'var(--text-muted)',
                          '&.Mui-checked': {
                            color: 'var(--accent)',
                          },
                        }}
                      />
                    )}
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    align={column.align || 'left'}
                    sx={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--text-secondary)',
                      py: 2,
                      px: 2,
                      '&:first-of-type': { pl: 3 },
                      '&:last-of-type': { pr: 3 },
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {column.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row) => {
                  const rowKey = getRowKey(row);
                  const isSelected = rowKey === selectedRowKey;
                  const isRowSelected = selectedKeys.has(rowKey);
                  const isClickable = typeof onRowClick === 'function';

                  return (
                    <TableRow
                      key={rowKey}
                      hover={isClickable || enableRowSelection}
                      onClick={isClickable ? () => onRowClick(row) : undefined}
                      sx={{
                        cursor: isClickable ? 'pointer' : 'default',
                        transition:
                          'background-color 120ms ease, transform 120ms ease',
                        '&:hover': {
                          bgcolor: isSelected
                            ? 'var(--accent-soft)'
                            : 'var(--bg-card-hover)',
                        },
                        '& .MuiTableCell-root': {
                          py: 1.5,
                          px: 2,
                          borderColor: 'var(--border-primary)',
                          transition: 'color 120ms ease',
                          '&:first-of-type': { pl: 3 },
                          '&:last-of-type': { pr: 3 },
                        },
                        ...(isSelected && {
                          bgcolor: 'var(--accent-soft)',
                          '& .MuiTableCell-root': {
                            color: 'var(--text-primary) !important',
                            fontWeight: 500,
                          },
                        }),
                      }}
                    >
                      {(enableRowSelection || searchable) && (
                        <TableCell padding="checkbox">
                          {enableRowSelection && (
                            <Checkbox
                              checked={isRowSelected}
                              onChange={() => handleSelectRow(rowKey)}
                              size="small"
                              sx={{
                                color: 'var(--text-muted)',
                                '&.Mui-checked': {
                                  color: 'var(--accent)',
                                },
                              }}
                            />
                          )}
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          align={column.align || 'left'}
                          className={`${
                            column.hideOnMobile ? 'hidden sm:table-cell' : ''
                          }`}
                        >
                          {column.render(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (enableRowSelection || searchable ? 1 : 0)
                    }
                    sx={{ py: 6 }}
                  >
                    <Box className="flex flex-col items-center justify-center py-4 text-center">
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          bgcolor: 'var(--accent-soft)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <svg
                          className="h-6 w-6 text-[var(--accent)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                          />
                        </svg>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          mb: 0.5,
                        }}
                      >
                        {emptyMessage}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'var(--text-muted)', fontSize: 13 }}
                      >
                        {searchQuery
                          ? `No se encontraron resultados para "${searchQuery}"`
                          : emptyDescription}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredRows.length > 0 && (
          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            labelRowsPerPage="Filas"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
            sx={{
              borderTop: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
                {
                  fontWeight: 500,
                },
            }}
          />
        )}
      </Paper>
    </div>
  );
}
