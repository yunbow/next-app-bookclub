import { NextRequest, NextResponse } from 'next/server';
import { generateICalEvent, CalendarEvent } from '@/lib/google-calendar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, location, startDate, endDate } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const event: CalendarEvent = {
      title,
      description,
      location,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    const icalContent = generateICalEvent(event);

    return new NextResponse(icalContent, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': `attachment; filename="event.ics"`,
      },
    });
  } catch (error) {
    console.error('Error generating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar event' },
      { status: 500 }
    );
  }
}
