const secondsPerMinute = 60;
const secondsPerHour = 60 * secondsPerMinute;
const secondsPerDay = 24 * secondsPerHour;

const padTime = (value) => String(value).padStart(2, "0");

export function getCountdownState({ startsAt, endsAt }, now = Date.now()) {
  if (!startsAt) {
    return { status: "pending", text: "待官方公布" };
  }

  const start = Date.parse(startsAt);
  const end = endsAt ? Date.parse(endsAt) : null;

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(now) ||
    (end !== null && (!Number.isFinite(end) || end <= start))
  ) {
    return { status: "invalid", text: "时间待确认" };
  }

  if (end !== null && now >= end) {
    return { status: "ended", text: "考试已结束" };
  }

  if (now >= start) {
    return {
      status: "started",
      text: end !== null ? "考试进行中" : "考试已开始"
    };
  }

  // Use the current absolute time on every refresh, avoiding timer drift.
  // Round up so the final partial second never looks like the exam has started.
  const remainingSeconds = Math.ceil((start - now) / 1000);
  const days = Math.floor(remainingSeconds / secondsPerDay);
  const hours = Math.floor((remainingSeconds % secondsPerDay) / secondsPerHour);
  const minutes = Math.floor((remainingSeconds % secondsPerHour) / secondsPerMinute);
  const seconds = remainingSeconds % secondsPerMinute;

  return {
    status: "upcoming",
    text: `还有 ${days} 天 ${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}`
  };
}
