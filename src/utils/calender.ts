export type CalendarDay = {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  iso: string; // YYYY-MM-DD for keys and comparison
};

export type SchoolEventType = "term" | "holiday" | "exam" | "pd" | "event";

export type SchoolEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: SchoolEventType;
};

/** Shape of events.json */
export type RawCalendarEvent = {
  title: string;
  date?: string;
  startDate?: string;
  endDate?: string;
};

export type CalendarData = {
  calendarName: string;
  events: RawCalendarEvent[];
  meta?: { totalSchoolDays?: number };
};

/** Infer event type from title for styling */
function inferEventType(title: string): SchoolEventType {
  const t = title.toLowerCase();
  if (/\bterm\b.*(begins|ends|starts)|(begins|ends|starts).*\bterm\b|\binnovation term\b/.test(t)) return "term";
  if (/\bbreak\b|holiday|christmas|thanksgiving|good friday|new year|reconciliation|goodwill|heritage|human rights|freedom|workers|youth|family day|women's day/.test(t)) return "holiday";
  if (/\bfaculty|in-service|no school|parent-teacher|student-led conferences/.test(t)) return "pd";
  if (/\bexam\b/.test(t)) return "exam";
  return "event";
}

/** Parse YYYY-MM-DD and return list of dates in [start, end] inclusive */
function datesInRange(start: string, end: string): string[] {
  const out: string[] = [];
  const d = new Date(start);
  const endD = new Date(end);
  if (d > endD) return [];
  while (d <= endD) {
    out.push(toISODate(new Date(d)));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** Load and normalize events from events.json. Expands date ranges into one event per day. */
export function loadEventsFromCalendarData(data: CalendarData): SchoolEvent[] {
  const out: SchoolEvent[] = [];
  let id = 0;
  for (const raw of data.events) {
    const type = inferEventType(raw.title);
    const slug = raw.title.replace(/\s+/g, "-").replace(/[^a-z0-9-]/gi, "").slice(0, 20) || "e";
    if (raw.date) {
      out.push({
        id: `evt-${id++}-${raw.date}-${slug}`,
        title: raw.title,
        date: raw.date,
        type,
      });
    } else if (raw.startDate && raw.endDate) {
      for (const date of datesInRange(raw.startDate, raw.endDate)) {
        out.push({
          id: `evt-${id++}-${date}-${slug}`,
          title: raw.title,
          date,
          type,
        });
      }
    }
  }
  return out;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getMonthName(date: Date): string {
  return MONTH_NAMES[date.getMonth()];
}

export function getDayNames(): string[] {
  return DAY_NAMES;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Build calendar grid for a month (6 rows × 7 days), with leading/trailing days from adjacent months. */
export function getCalendarWeeks(year: number, month: number): CalendarDay[][] {
  const first = new Date(year, month, 1);
  const startDow = first.getDay();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weeks: CalendarDay[][] = [];
  let week: CalendarDay[] = [];
  const totalCells = 42; // 6 weeks

  for (let i = 0; i < totalCells; i++) {
    const cellDate = new Date(year, month, 1);
    cellDate.setDate(1 - startDow + i);
    const iso = toISODate(cellDate);
    const isCurrentMonth = cellDate.getMonth() === month;
    const dayOfMonth = cellDate.getDate();
    const isToday = isSameDay(cellDate, today);

    week.push({
      date: cellDate,
      dayOfMonth,
      isCurrentMonth,
      isToday,
      iso,
    });

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  return weeks;
}

/** Sample school events for demo (term dates, holidays, etc.). Replace with real data later. */
export function getSampleSchoolEvents(year: number): SchoolEvent[] {
  const events: SchoolEvent[] = [];
  const id = (d: string, t: string) => `${d}-${t}-${Math.random().toString(36).slice(2, 6)}`;

  // Term 1 start/end (example: Sep–Dec)
  events.push({ id: id("t1s", "term"), title: "Term 1 starts", date: `${year}-09-02`, type: "term" });
  events.push({ id: id("t1e", "term"), title: "Term 1 ends", date: `${year}-12-20`, type: "term" });
  // Term 2 (Jan–Mar)
  events.push({ id: id("t2s", "term"), title: "Term 2 starts", date: `${year}-01-06`, type: "term" });
  events.push({ id: id("t2e", "term"), title: "Term 2 ends", date: `${year}-03-28`, type: "term" });
  // Holidays
  events.push({ id: id("h1", "holiday"), title: "Fall break", date: `${year}-10-14`, type: "holiday" });
  events.push({ id: id("h2", "holiday"), title: "Winter break", date: `${year}-12-23`, type: "holiday" });
  events.push({ id: id("h3", "holiday"), title: "Spring break", date: `${year}-04-07`, type: "holiday" });
  // PD day
  events.push({ id: id("pd1", "pd"), title: "PD Day (no students)", date: `${year}-11-11`, type: "pd" });
  // Exam week example
  events.push({ id: id("ex1", "exam"), title: "Exams begin", date: `${year}-12-09`, type: "exam" });
  events.push({ id: id("ex2", "exam"), title: "Exams end", date: `${year}-12-13`, type: "exam" });

  return events;
}

export function getEventsForDate(events: SchoolEvent[], isoDate: string): SchoolEvent[] {
  return events.filter((e) => e.date === isoDate);
}

/** One row for the "Events in {month}" list: single date or range, with type for styling */
export type MonthListEvent = {
  title: string;
  type: SchoolEventType;
  dateLabel: string;
};

/** Raw events that touch the given month, one per logical event, for the sidebar list */
export function getMonthListFromCalendarData(
  data: CalendarData,
  year: number,
  month: number
): MonthListEvent[] {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const out: MonthListEvent[] = [];
  for (const raw of data.events) {
    let inMonth = false;
    let dateLabel: string;
    if (raw.date) {
      dateLabel = raw.date;
      const d = new Date(raw.date);
      inMonth = d >= monthStart && d <= monthEnd;
    } else if (raw.startDate && raw.endDate) {
      dateLabel = `${raw.startDate} – ${raw.endDate}`;
      const start = new Date(raw.startDate);
      const end = new Date(raw.endDate);
      inMonth = start <= monthEnd && end >= monthStart;
    } else continue;
    if (!inMonth) continue;
    out.push({
      title: raw.title,
      type: inferEventType(raw.title),
      dateLabel,
    });
  }
  return out.sort((a, b) => a.dateLabel.localeCompare(b.dateLabel));
}
