export interface ActivityHeatmapDatum {
  /** Date formatted as YYYY-MM-DD in local time */
  date: string;
  /** Number of individual exercise sessions recorded for the date */
  sessions: number;
  /** Number of routine completions recorded for the date */
  routines: number;
}

export type ActivityHeatmapProps = Record<string, never>;

export interface HeatmapCell {
  key: string;
  date: Date;
  weekIndex: number;
  dayIndex: number;
  value: number;
  sessions: number;
  routines: number;
}
