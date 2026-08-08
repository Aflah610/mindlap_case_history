/**
 * Utility functions for date and time formatting across Mindlap Healthcare Platform.
 * Ensures consistent 12-hour AM/PM formatting and correct local timezone representation.
 */

export const formatAppointmentTime = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const formatAppointmentDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' });
};

export const formatAppointmentDateTime = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString([], {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
