export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface WorkingHours {
  day: DayOfWeek;
  isWorking: boolean;
  start: string;
  end: string;
}
