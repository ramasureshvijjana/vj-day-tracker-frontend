function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Groups a start-time-sorted list of logs into clusters where consecutive
 * items' time ranges overlap (e.g. a 5:45–6:00 food item inside a
 * 5:01–6:00 task). Each cluster is an array of 1+ logs; clusters with a
 * single item are just a normal, un-highlighted row.
 */
export function groupOverlapping(sortedLogs) {
  const groups = [];
  let current = [];
  let currentMaxEnd = -1;

  for (const log of sortedLogs) {
    const start = toMinutes(log.start_time.slice(0, 5));
    const end = toMinutes(log.end_time.slice(0, 5));

    if (current.length === 0 || start < currentMaxEnd) {
      current.push(log);
      currentMaxEnd = Math.max(currentMaxEnd, end);
    } else {
      groups.push(current);
      current = [log];
      currentMaxEnd = end;
    }
  }
  if (current.length) groups.push(current);
  return groups;
}
