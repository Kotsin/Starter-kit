export enum TimePoints {
  TODAY_START = 'TODAY_START',
  YESTERDAY_START = 'YESTERDAY_START',
  TOMORROW_END = 'TOMORROW_END',
  THREE_MONTH_AGO = 'THREE_MONTH_AGO',
  THREE_MONTH_LATER = 'THREE_MONTH_LATER',
}

export function getUnixTimePoint(point: TimePoints): number {
  const currentDate = new Date();

  switch (point) {
    case TimePoints.TODAY_START:
      return currentDate.setHours(0, 0, 0, 0);
    case TimePoints.YESTERDAY_START:
      return new Date(new Date().setDate(currentDate.getDate() - 1)).setHours(
        0,
        0,
        0,
        0,
      );
    case TimePoints.TOMORROW_END:
      return new Date(new Date().setDate(currentDate.getDate() + 1)).setHours(
        23,
        59,
        59,
        999,
      );

    case TimePoints.THREE_MONTH_AGO:
      return new Date().setMonth(currentDate.getMonth() - 3);
    case TimePoints.THREE_MONTH_LATER:
      return new Date().setMonth(currentDate.getMonth() + 3);
  }
}
