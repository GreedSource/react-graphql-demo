import { DarkMode, LightMode } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useThemeStore } from '@/stores/theme.store';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <IconButton
      onClick={toggleTheme}
      size="small"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      sx={{
        color: 'inherit',
        bgcolor: 'surface.elevated',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          bgcolor: 'surface.card-hover',
          transform: 'scale(1.08) rotate(15deg)',
        },
        '&:active': {
          transform: 'scale(0.95) rotate(0deg)',
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
}
