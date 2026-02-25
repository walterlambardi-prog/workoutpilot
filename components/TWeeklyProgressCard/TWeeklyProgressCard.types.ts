/**
 * Types for the TWeeklyProgressCard component.
 *
 * Displays a premium weekly fitness progress dashboard with:
 * - Daily activity bar chart (current week)
 * - Week-over-week trend comparison
 * - Training focus / category breakdown
 * - Personal records
 */

export interface DailyActivity {
  /** Translation key suffix: "mon", "tue", etc. */
  dayKey: string;
  /** Day of month (1–31) */
  dayNumber: number;
  totalReps: number;
  totalMinutes: number;
  totalSteps: number;
  sessions: number;
  /** Normalized composite score used for bar sizing */
  activityScore: number;
  /** Calculated pixel height for the bar chart (0–BAR_CHART_MAX_HEIGHT) */
  barHeight: number;
  isToday: boolean;
  isFuture: boolean;
}

export type CategoryColorScheme = "blue" | "green" | "purple" | "orange";

export interface CategoryBreakdown {
  category: string;
  translationKey: string;
  sessionCount: number;
  /** 0–100 */
  percentage: number;
  colorScheme: CategoryColorScheme;
}

export interface PersonalRecord {
  type: "bestSession" | "totalAllTime" | "longestWalk" | "topExercise";
  /** Ionicons icon name */
  icon: string;
  label: string;
  value: string;
  colorScheme: CategoryColorScheme;
}

export interface WeekSummary {
  totalReps: number;
  totalMinutes: number;
  totalSessions: number;
  totalSteps: number;
}

export interface WeeklyProgressData {
  dailyActivity: DailyActivity[];
  currentWeek: WeekSummary;
  previousWeek: WeekSummary;
  /** Percentage change of composite activity score vs previous week */
  trendPercentage: number;
  categoryBreakdown: CategoryBreakdown[];
  personalRecords: PersonalRecord[];
  /** True if any activity exists in history at all */
  hasData: boolean;
  /** True if current week has at least one session */
  hasWeekData: boolean;
}

export interface TWeeklyProgressCardProps {
  data: WeeklyProgressData;
}
