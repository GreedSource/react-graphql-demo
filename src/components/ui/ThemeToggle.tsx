import type * as React from 'react';
import { DarkMode, LightMode } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useThemeStore } from '@/stores/theme.store';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <IconButton
      onClick={toggleTheme}
      size="small"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      sx={{
        color: 'inherit',
        border: '1px solid var(--border-primary)',
        bgcolor: 'var(--bg-card)',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          bgcolor: 'var(--bg-card-hover)',
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      }}
    >
      {theme === 'dark' ? (
        <LightMode fontSize="small" />
      ) : (
        <DarkMode fontSize="small" />
      )}
    </IconButton>
  );
};

export default ThemeToggle;
