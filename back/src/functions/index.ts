export function getDayRange(date: any): { start: Date; end: Date } {
  let start = new Date(date);
  start.setHours(0, 0, 0, 0);

  let end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
