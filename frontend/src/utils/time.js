/**
 * Converts a 24-hour time string ("HH:MM" or "HH:MM:SS") into a
 * 12-hour display string with AM/PM, e.g. "07:00" -> "7:00 AM".
 */
export function formatTime12h(time24) {
  if (!time24) return "";
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? "00";
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${period}`;
}

/**
 * Formats a start/end pair, e.g. ("07:00", "08:30") -> "7:00 AM – 8:30 AM".
 */
export function formatTimeRange12h(start, end) {
  return `${formatTime12h(start)} – ${formatTime12h(end)}`;
}
