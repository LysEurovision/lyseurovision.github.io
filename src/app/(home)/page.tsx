import Legend from '@/app/(home)/legend';
import CalendarSkeleton from '@/app/(home)/components/calendar-skeleton';
import EventList from '@/app/(home)/components/event-list';
import { Suspense } from 'react';
import EventChart from '@/app/(home)/components/event-chart';

export default async function HomeCalendar() {
    const eventData = fetch('https://raw.githubusercontent.com/LysEurovision/lyseurovision.github.io/refs/heads/main/lys_dump.json').then(res => res.json());

    return (
        <div className="flex flex-col gap-3">
            <Legend/>
            <Suspense fallback={'Loading...'}>
                <EventChart loadedEvents={eventData} />
            </Suspense>
            <Suspense fallback={<CalendarSkeleton/>}>
                <EventList loadedEvents={eventData} />
            </Suspense>
        </div>
    );
}