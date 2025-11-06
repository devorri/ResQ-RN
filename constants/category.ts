import { IncidentCategory } from '@/types';
import { COLORS } from './colors';

export const CATEGORY_CONFIG: Record<
  IncidentCategory,
  {
    label: string;
    color: string;
    icon: string;
    darkColor: string;
  }
> = {
  police: {
    label: 'Police',
    color: COLORS.category.police,
    darkColor: COLORS.category.policeDark,
    icon: 'shield',
  },
  fire: {
    label: 'Fire',
    color: COLORS.category.fire,
    darkColor: COLORS.category.fireDark,
    icon: 'flame',
  },
  ambulance: {
    label: 'Ambulance',
    color: COLORS.category.ambulance,
    darkColor: COLORS.category.ambulanceDark,
    icon: 'heart-pulse',
  },
};

export const SEVERITY_CONFIG = {
  low: {
    label: 'Low',
    color: COLORS.status.success,
    textColor: '#065F46',
    bgColor: COLORS.status.successBg,
  },
  medium: {
    label: 'Medium',
    color: COLORS.status.warning,
    textColor: '#92400E',
    bgColor: COLORS.status.warningBg,
  },
  high: {
    label: 'High',
    color: COLORS.status.error,
    textColor: '#991B1B',
    bgColor: COLORS.status.errorBg,
  },
  critical: {
    label: 'Critical',
    color: COLORS.primary.red,
    textColor: '#7C2D12',
    bgColor: '#FEE2E2',
  },
};

export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: COLORS.text.secondary,
    bgColor: COLORS.background.gray,
  },
  accepted: {
    label: 'Accepted',
    color: COLORS.status.info,
    bgColor: COLORS.status.infoBg,
  },
  in_progress: {
    label: 'In Progress',
    color: COLORS.status.warning,
    bgColor: COLORS.status.warningBg,
  },
  completed: {
    label: 'Completed',
    color: COLORS.status.success,
    bgColor: COLORS.status.successBg,
  },
  cancelled: {
    label: 'Cancelled',
    color: COLORS.status.error,
    bgColor: COLORS.status.errorBg,
  },
};
