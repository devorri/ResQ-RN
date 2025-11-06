export const COLORS = {
  primary: {
    red: '#D40000',
    redLight: '#E12C2C',
    orange: '#FFA500',
    gold: '#FFD700',
    lightYellow: '#F8FFE5',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    white: '#FFFFFF',
  },
  background: {
    white: '#FFFFFF',
    light: '#F9FAFB',
    gray: '#F3F4F6',
  },
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
  },
  status: {
    success: '#10B981',
    successBg: '#D1FAE5',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    error: '#EF4444',
    errorBg: '#FEE2E2',
    info: '#3B82F6',
    infoBg: '#DBEAFE',
  },
  category: {
    police: '#3B82F6',
    policeDark: '#2563EB',
    fire: '#D40000',
    fireDark: '#B30000',
    ambulance: '#10B981',
    ambulanceDark: '#059669',
  },
};

export default {
  light: {
    text: COLORS.text.primary,
    background: COLORS.background.white,
    tint: COLORS.primary.red,
    tabIconDefault: COLORS.text.tertiary,
    tabIconSelected: COLORS.primary.red,
  },
};
