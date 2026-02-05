import { useMemo, useState } from "react";
import eventsJson from "../assets/events.json";
import {
  getCalendarWeeks,
  getDayNames,
  getMonthName,
  loadEventsFromCalendarData,
  getEventsForDate,
  getMonthListFromCalendarData,
  type CalendarData,
  type CalendarDay,
  type SchoolEvent,
  type SchoolEventType,
} from "../utils/calender";

const calendarData = eventsJson as CalendarData;

const EVENT_TYPE_STYLES: Record<
  SchoolEventType,
  { bg: string; text: string; label: string }
> = {
  term: { bg: "bg-blue-100", text: "text-blue-800", label: "Term" },
  holiday: { bg: "bg-yellow-100", text: "text-yellow-900", label: "Holiday" },
  exam: { bg: "bg-blue-200", text: "text-blue-900", label: "Exam" },
  pd: { bg: "bg-slate-100", text: "text-slate-700", label: "PD Day" },
  event: { bg: "bg-yellow-100", text: "text-yellow-900", label: "Event" },
};

const Calender = () => {
  const [viewDate, setViewDate] = useState(() => new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const weeks = useMemo(
    () => getCalendarWeeks(year, month),
    [year, month]
  );
  const dayNames = getDayNames();
  const monthName = getMonthName(viewDate);

  const events = useMemo(() => loadEventsFromCalendarData(calendarData), []);
  const monthListEvents = useMemo(
    () => getMonthListFromCalendarData(calendarData, year, month),
    [year, month]
  );

  const goPrev = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  };
  const goNext = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
  };
  const goToday = () => {
    setViewDate(new Date());
  };

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-900 sm:text-4xl">
            {calendarData.calendarName}
          </h1>
          <p className="mt-1 text-slate-500">
            Terms, holidays, exams &amp; PD days
          </p>
        </header>

        {/* Month navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-blue-800 shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Previous month"
            >
              ←
            </button>
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-blue-800 shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Next month"
            >
              →
            </button>
          </div>
          <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">
            {monthName} {year}
          </h2>
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border border-yellow-400 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-900 transition hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            Today
          </button>
        </div>

        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-3 text-sm">
          {(
            Object.entries(EVENT_TYPE_STYLES) as [SchoolEventType, (typeof EVENT_TYPE_STYLES)[SchoolEventType]][]
          ).map(([type, { bg, text, label }]) => (
            <span
              key={type}
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${bg} ${text}`}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
          <div className="grid grid-cols-7">
            {dayNames.map((day) => (
              <div
                key={day}
                className="border-b border-blue-100 bg-blue-50/60 py-2 text-center text-xs font-semibold uppercase tracking-wider text-blue-800"
              >
                {day}
              </div>
            ))}
            {weeks.flat().map((day) => (
              <DayCell key={day.iso} day={day} events={getEventsForDate(events, day.iso)} />
            ))}
          </div>
        </div>

        {/* List of events this month (optional) */}
        <section className="mt-8">
          <h3 className="mb-3 text-lg font-semibold text-blue-900">
            Events in {monthName}
          </h3>
          <ul className="space-y-2">
            {monthListEvents.map((evt, i) => {
              const style = EVENT_TYPE_STYLES[evt.type];
              return (
                <li
                  key={`${evt.dateLabel}-${evt.title}-${i}`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 ${style.bg} ${style.text}`}
                >
                  <span className="font-mono text-sm font-medium opacity-80 shrink-0">
                    {evt.dateLabel}
                  </span>
                  <span className="font-medium">{evt.title}</span>
                  <span className="text-xs opacity-80 shrink-0">({style.label})</span>
                </li>
              );
            })}
            {monthListEvents.length === 0 && (
              <li className="rounded-lg bg-slate-50 px-3 py-4 text-center text-slate-500">
                No events scheduled this month.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
};

function DayCell({
  day,
  events,
}: {
  day: CalendarDay;
  events: SchoolEvent[];
}) {
  const isCurrentMonth = day.isCurrentMonth;
  const isToday = day.isToday;

  return (
    <div
      className={`min-h-[88px] border-b border-r border-blue-50/80 p-1.5 sm:min-h-[96px] sm:p-2 ${
        !isCurrentMonth ? "bg-slate-50/50" : "bg-white"
      }`}
    >
      <div className="flex h-full flex-col">
        <span
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
            !isCurrentMonth
              ? "text-slate-400"
              : isToday
                ? "bg-blue-600 text-white"
                : "text-slate-700"
          }`}
        >
          {day.dayOfMonth}
        </span>
        <div className="mt-1 flex flex-1 flex-wrap gap-0.5 overflow-hidden">
          {events.slice(0, 3).map((evt) => {
            const style = EVENT_TYPE_STYLES[evt.type];
            return (
              <span
                key={evt.id}
                className={`max-w-full truncate rounded px-1 py-0.5 text-[10px] font-medium sm:text-xs ${style.bg} ${style.text}`}
                title={evt.title}
              >
                {evt.title}
              </span>
            );
          })}
          {events.length > 3 && (
            <span className="text-[10px] text-slate-500">+{events.length - 3}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calender;
