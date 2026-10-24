// Checked against the official CET and graduate admissions notices on 2026-10-23.
// Keep unannounced dates null; only set timestamps after an official notice.
export const countdownEvents = [
  {
    id: "cet6-2026-12",
    title: "2026 年 12 月英语六级",
    startsAt: "2026-12-12T15:00:00+08:00",
    endsAt: "2026-12-12T17:25:00+08:00",
    note: "笔试 15:00—17:25 · 官方已公布",
    sourceLabel: "中国教育考试网通知",
    sourceHref: "https://cet.neea.cn/xhtml1/report/2609/1-1.htm"
  },
  {
    id: "postgraduate-2028",
    title: "2028 考研初试（2027 年举行）",
    startsAt: null,
    endsAt: null,
    scheduleLabel: "预计 2027 年 12 月",
    note: "具体日期及开考时间待教育部公布。",
    sourceLabel: "关注研招网公告",
    sourceHref: "https://yz.chsi.com.cn/"
  }
];
