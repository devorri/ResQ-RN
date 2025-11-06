import { COLORS } from './colors';

export const Colors = {
  light: {
    text: COLORS.text.primary,
    background: COLORS.background.white,
    tint: COLORS.primary.red,
    icon: COLORS.text.secondary,
    tabIconDefault: COLORS.text.tertiary,
    tabIconSelected: COLORS.primary.red,
    border: COLORS.border.light,
    success: COLORS.status.success,
    warning: COLORS.status.warning,
    error: COLORS.status.error,
    info: COLORS.status.info,
  },
  dark: {
    text: COLORS.text.white,
    background: COLORS.background.gray,
    tint: COLORS.primary.orange,
    icon: COLORS.text.tertiary,
    tabIconDefault: COLORS.text.secondary,
    tabIconSelected: COLORS.primary.orange,
    border: COLORS.border.medium,
    success: COLORS.status.success,
    warning: COLORS.status.warning,
    error: COLORS.status.error,
    info: COLORS.status.info,
  },
};

export type Theme = keyof typeof Colors; 
