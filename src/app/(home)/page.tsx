import Legend from '@/app/(home)/legend';
import CalendarSkeleton from '@/app/(home)/components/calendar-skeleton';
import EventList from '@/app/(home)/components/event-list';
import { Suspense } from 'react';
import { Event } from '../model/event';

export default async function HomeCalendar() {
    // const eventData = await fetch('https://raw.githubusercontent.com/LysEurovision/lyseurovision.github.io/refs/heads/main/lys_dump.json');
    // const formatter = new Intl.DateTimeFormat('sv-SE', {
    //     timezone: 'Europe/Vienna',
    //     year: 'numeric', month: '2-digit', day: '2-digit',
    //     hour: '2-digit', minute: '2-digit', second: '2-digit',
    //     hour12: false
    // });
    // const nowStr = formatter.format(new Date()).replace(' ', 'T');
    // const events: Event[] = (await eventData.json() as Omit<Event, 'past'>[]).map(e => ({
    //     ...e,
    //     past: e.endDateTimeCet < nowStr
    // }));
    const eventData = fetch('https://raw.githubusercontent.com/LysEurovision/lyseurovision.github.io/refs/heads/main/lys_dump.json').then(res => res.json());

    return (
        <div className="flex flex-col gap-3">
            <Legend/>
            <Suspense fallback={<CalendarSkeleton/>}>
                <EventList loadedEvents={eventData} />
            </Suspense>
        </div>
    );
}