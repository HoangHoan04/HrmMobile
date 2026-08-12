import { enumData } from "@/constants/enums/enumData";

export type DayOfWeekCode =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export type DayOfWeekItem =
  (typeof enumData.DAY_OF_WEEK)[keyof typeof enumData.DAY_OF_WEEK];

export const CALENDAR_WEEKDAYS: DayOfWeekItem[] = [
  enumData.DAY_OF_WEEK.SUNDAY,
  enumData.DAY_OF_WEEK.MONDAY,
  enumData.DAY_OF_WEEK.TUESDAY,
  enumData.DAY_OF_WEEK.WEDNESDAY,
  enumData.DAY_OF_WEEK.THURSDAY,
  enumData.DAY_OF_WEEK.FRIDAY,
  enumData.DAY_OF_WEEK.SATURDAY,
];

export function getCalendarWeekdayLabels(t: (key: string) => string): string[] {
  return CALENDAR_WEEKDAYS.map((d) => t(d.labelKey));
}
