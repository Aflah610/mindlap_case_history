import React from 'react';
import { Appointment } from '../types';
import { Calendar as CalendarIcon, Clock, User, Video, MapPin } from 'lucide-react';

interface TherapistPersonalCalendarProps {
  appointments: Appointment[];
}

export const TherapistPersonalCalendar: React.FC<TherapistPersonalCalendarProps> = ({ appointments }) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {daysOfWeek.map((day, idx) => {
          const isToday = idx === 6; // Sunday/Current day simulation
          return (
            <div key={day} className={`p-3 rounded-xl border flex flex-col gap-2 min-h-[220px] ${
              isToday ? 'bg-sky-50/50 border-sky-300 ring-2 ring-sky-100' : 'bg-slate-50/50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-700">{day}</span>
                {isToday && (
                  <span className="text-[9px] font-extrabold bg-sky-600 text-white px-2 py-0.5 rounded-full uppercase">
                    Today
                  </span>
                )}
              </div>

              <div className="space-y-2 flex-1">
                {appointments.slice(0, 2).map((app) => (
                  <div key={app.id} className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-sky-700 font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {app.mode === 'Online' ? (
                        <span className="text-teal-600 flex items-center gap-0.5"><Video className="w-2.5 h-2.5" /> Online</span>
                      ) : (
                        <span className="text-slate-600 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> Offline</span>
                      )}
                    </div>
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {app.client_detail?.full_name || `Client #${app.client}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
