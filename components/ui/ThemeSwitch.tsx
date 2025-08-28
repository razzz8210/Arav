import { memo } from 'react';

interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch = memo(({ className: _className }: ThemeSwitchProps) => {
  // Theme is locked to dark mode - don't render the switch
  return null;
});
