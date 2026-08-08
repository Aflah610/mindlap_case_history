import React from 'react';
import { Appointment } from '../types';
import { Calendar as CalendarIcon, Clock, User, Video, MapPin, CalendarDays } from 'lucide-react';
import { formatAppointmentTime } from '../utils/dateUtils';

interface TherapistPersonalCalendarProps {
  appointments: Appointment[];
}

export const TherapistPersonalCalendar: React.FC<TherapistPersonalCalendarProps> = ({ appointments }) => {
  // Get current week dates (Monday to Sunday)
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
  // Distance to Monday: if 0 (Sunday), minus 6 days. Else 1 - currentDayOfWeek
  const distToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + distToMonday);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    return dayDate;
  });

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const isSameDate = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-sky-600" />
            My Clinical Session Schedule (Google Calendar View)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Your personal upcoming consultation timetable</p>
        </div>
        <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-sky-600" />
          <span>Week of {monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((dayDate, idx) => {
          const isToday = isSameDate(today, dayDate);
          const dayAppointments = appointments.filter((app) => {
            if (!app.appointment_date) return false;
            const appDate = new Date(app.appointment_date);
            return isSameDate(appDate, dayDate);
          });

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col gap-2 min-h-[220px] transition-all ${
                isToday
                  ? 'bg-sky-50/70 border-sky-400 ring-2 ring-sky-200/60 shadow-sm'
                  : 'bg-slate-50/50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <div className="text-xs font-extrabold text-slate-800">{dayNames[idx]}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    {dayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                {isToday && (
                  <span className="text-[9px] font-extrabold bg-sky-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Today
                  </span>
                )}
              </div>

              <div className="space-y-2 flex-1 mt-1">
                {dayAppointments.length > 0 ? (
                  dayAppointments.map((app) => (
                    <div
                      key={app.id}
                      className="p-2.5 bg-white border border-sky-200 rounded-lg shadow-sm space-y-1 text-xs hover:border-sky-400 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[10px] text-sky-700 font-bold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-sky-500" />
                          {formatAppointmentTime(app.appointment_date)}
                        </span>
                        {app.mode === 'Online' ? (
                          <span className="text-teal-600 flex items-center gap-0.5">
                            <Video className="w-2.5 h-2.5" /> Online
                          </span>
                        ) : (
                          <span className="text-slate-600 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" /> Offline
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {app.client_detail?.full_name || `Client #${app.client}`}
                      </div>
                      {app.remarks && (
                        <div className="text-[10px] text-slate-500 italic truncate" title={app.remarks}>
                          {app.remarks}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-2">
                    <span className="text-[10px] font-semibold italic text-slate-400">No sessions</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
