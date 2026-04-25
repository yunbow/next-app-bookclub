/**
 * Google Calendar integration utilities
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Generate Google Calendar add event URL
 * This creates a URL that opens Google Calendar with pre-filled event details
 */
export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(event.startDate)}/${formatDate(event.endDate)}`,
    ...(event.description && { details: event.description }),
    ...(event.location && { location: event.location }),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate iCal format for event (for download)
 */
export function generateICalEvent(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BookClub//Event//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${event.title}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${event.location}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Create event data from reading club event
 */
export function createEventFromReadingClub(
  title: string,
  date: Date,
  location: string | null,
  isOnline: boolean,
  description?: string
): CalendarEvent {
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setHours(endDate.getHours() + 2); // Default 2 hour duration

  return {
    title: `読書会: ${title}`,
    description: description || '',
    location: isOnline ? 'オンライン' : location || '',
    startDate,
    endDate,
  };
}
