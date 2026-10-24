import assert from "node:assert/strict";
import test from "node:test";
import { getCountdownState } from "./countdown.js";

const exam = {
  startsAt: "2026-12-12T15:00:00+08:00",
  endsAt: "2026-12-12T17:25:00+08:00"
};

test("unannounced exams do not count down to a guessed date", () => {
  assert.deepEqual(getCountdownState({ startsAt: null, endsAt: null }), {
    status: "pending", text: "待官方公布"
  });
});

test("Beijing exam times count down to the same instant in UTC", () => {
  assert.deepEqual(getCountdownState(exam, Date.parse("2026-12-12T06:00:00Z")), {
    status: "upcoming", text: "还有 0 天 01:00:00"
  });
});

test("day boundaries retain the remaining seconds", () => {
  assert.equal(
    getCountdownState(exam, Date.parse("2026-12-11T14:59:59+08:00")).text,
    "还有 1 天 00:00:01"
  );
});

test("the final partial second stays upcoming", () => {
  assert.deepEqual(getCountdownState(exam, Date.parse(exam.startsAt) - 1), {
    status: "upcoming", text: "还有 0 天 00:00:01"
  });
});

test("the start instant switches to the in-progress state", () => {
  assert.deepEqual(getCountdownState(exam, Date.parse(exam.startsAt)), {
    status: "started", text: "考试进行中"
  });
});

test("the last instant before the end is still in progress", () => {
  assert.equal(getCountdownState(exam, Date.parse(exam.endsAt) - 1).text, "考试进行中");
});

test("the end instant and later dates never produce negative countdowns", () => {
  for (const now of [Date.parse(exam.endsAt), Date.parse("2027-01-01T00:00:00Z")]) {
    assert.deepEqual(getCountdownState(exam, now), {
      status: "ended", text: "考试已结束"
    });
  }
});

test("resuming after a long pause recalculates from the current time", () => {
  const before = getCountdownState(exam, Date.parse("2026-12-10T15:00:00+08:00"));
  const resumed = getCountdownState(exam, Date.parse("2026-12-12T14:59:00+08:00"));
  assert.equal(before.text, "还有 2 天 00:00:00");
  assert.equal(resumed.text, "还有 0 天 00:01:00");
});

test("a confirmed start without an end remains a valid countdown", () => {
  assert.deepEqual(
    getCountdownState({ startsAt: exam.startsAt, endsAt: null }, Date.parse(exam.startsAt)),
    { status: "started", text: "考试已开始" }
  );
});

test("invalid schedules display a recoverable status instead of NaN", () => {
  for (const invalid of [
    { startsAt: "invalid", endsAt: null },
    { ...exam, endsAt: "invalid" },
    { ...exam, endsAt: exam.startsAt },
    { ...exam, endsAt: "2026-12-12T14:00:00+08:00" }
  ]) {
    assert.deepEqual(getCountdownState(invalid), {
      status: "invalid", text: "时间待确认"
    });
  }
});
