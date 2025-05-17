export enum TimePeriod {
  ONE_HOUR = '1h',
  TWELVE_HOURS = '12h',
  STK = 'stk',
  DAY = 'day',
  WEEK = 'week',
  TWO_WEEK = 'two_week',
  MONTH = 'month',
  YESTERDAY = 'yesterday',
}

export interface ITimePeriod {
  time_from: Date;
  time_to: Date;
}

// TODO useless parameter _
export function getTimePeriod(period: TimePeriod, _: number): ITimePeriod {
  try {
    const timeFrom = new Date(Date.now());
    const timeTo = new Date(Date.now());
    const timeToDifference = new Date(Date.now());
    let hours = 0;

    if (period === TimePeriod.ONE_HOUR) {
      hours = 1;
    } else if (period === TimePeriod.TWELVE_HOURS) {
      hours = 12;
    } else if (period === TimePeriod.DAY) {
      hours = 24;
    } else if (period === TimePeriod.STK) {
      const timeFrom = new Date(Date.now());

      timeFrom.setHours(0, 0, 0, 0);
      const timeTo = new Date(Date.now());

      timeTo.setHours(24, 0, 0, 0);

      return {
        time_from: timeFrom,
        time_to: timeTo,
      };
    } else if (period === TimePeriod.WEEK) {
      hours = 24 * 7;
    } else if (period === TimePeriod.TWO_WEEK) {
      hours = 24 * 14;
    } else if (period === TimePeriod.MONTH) {
      hours = 24 * 30;
    } else if (period === TimePeriod.YESTERDAY) {
      const currentTime = new Date(Date.now());
      const timeFrom = new Date(Date.now());
      const timeTo = new Date(Date.now());

      let timeToDifference = new Date(Date.now());

      timeToDifference.setHours(-48, currentTime.getMinutes());
      let differenceInTime = currentTime.getTime() - timeToDifference.getTime();

      differenceInTime = differenceInTime / (1000 * 3600) - 48;
      timeFrom.setHours(-(48 - differenceInTime), currentTime.getMinutes());

      timeToDifference = new Date(Date.now());
      timeToDifference.setHours(-24, currentTime.getMinutes());
      differenceInTime = currentTime.getTime() - timeToDifference.getTime();
      differenceInTime = differenceInTime / (1000 * 3600) - 24;
      timeTo.setHours(-(24 - differenceInTime), currentTime.getMinutes());

      return {
        time_from: timeFrom,
        time_to: timeTo,
      };
    } else {
      hours = 24;
    }

    timeToDifference.setHours(-hours, timeTo.getMinutes());
    let differenceInTime = timeTo.getTime() - timeToDifference.getTime();

    differenceInTime = differenceInTime / (1000 * 3600) - hours;

    timeFrom.setHours(-(hours - differenceInTime), timeTo.getMinutes());

    return {
      time_from: timeFrom,
      time_to: timeTo,
    };
  } catch (e) {
    const timeFrom = new Date(Date.now());

    timeFrom.setHours(0, 0, 0, 0);
    const timeTo = new Date(Date.now());

    timeTo.setHours(24, 0, 0, 0);

    return {
      time_from: timeFrom,
      time_to: timeTo,
    };
  }
}
