'use client';

import { BackendEvent, Event } from '../../model/event';
import { use, useState } from 'react';
import EventCard from '@/app/(home)/components/event-card';
import { ArrowUp, Calendar, Trophy } from 'lucide-react';
import { clsx } from 'clsx';

export default function EventList({loadedEvents}: { loadedEvents: Promise<BackendEvent> }) {
    const now = new Date();
    const nowStr = now.toISOString().replace(' ', 'T');
    const daysUntilSunday = (7 - now.getDay()) % 7;
    const daysSinceMonday = (now.getDay() + 6) % 7;
    const eow = new Date();
    const sow = new Date();
    eow.setDate(now.getDate() + daysUntilSunday);
    sow.setDate(now.getDate() - daysSinceMonday);
    const eowStr = eow.toISOString().slice(0, 10) + 'T23:59:59';
    const sowStr = sow.toISOString().slice(0, 10) + 'T00:00:00';

    const events: Event[] = (use(loadedEvents) as BackendEvent[]).map(e => ({
        ...e,
        past: e.endDateTimeCet < nowStr,
        live: e.dateTimeCet >= nowStr && e.endDateTimeCet <= nowStr,
    }));

    const getUpcomingEvents = (events: Event[]) => {
        return events.filter(event => !event.past);
    }

    const [baseEvents, setBaseEvents] = useState<Event[]>(getUpcomingEvents(events));
    const [displayedEvents, setDisplayedEvents] = useState<Event[]>(baseEvents);
    const [showPast, setShowPast] = useState<boolean>(false);
    const [showFinals, setShowFinals] = useState<boolean>(false);
    const [showThisWeek, setShowThisWeek] = useState<boolean>(false);

    const showPastEvents = () => {
        setBaseEvents(events);
        setDisplayedEvents(events.filter(event => eventFilterPredicate(event, showFinals, showThisWeek)));
        setShowPast(true);
    }

    const isEventThisWeek: (event: Event) => boolean = (event: Event) => {
        return event.dateTimeCet >= sowStr && event.endDateTimeCet <= eowStr;
    };

    function eventFilterPredicate(event: Event, showFinals: boolean, showThisWeek: boolean): boolean {
        return (!showFinals ? true : event.stage === 'Final' || event.stage === 'Eurovision Night')
            && (!showThisWeek ? true : isEventThisWeek(event));
    }

    const toggleShowFinals = () => {
        setDisplayedEvents(baseEvents.filter(event => eventFilterPredicate(event, !showFinals, showThisWeek)));
        setShowFinals(!showFinals);
    };

    const toggleShowThisWeek = () => {
        setDisplayedEvents(baseEvents.filter(event => eventFilterPredicate(event, showFinals, !showThisWeek)));
        setShowThisWeek(!showThisWeek);
    };

    return (
        <div className="flex flex-col gap-2">

            {/* Filters */}
            <div className="flex flex-col gap-2">
                <div className="italic">Filters</div>
                <div className="flex gap-2">
                    <div
                        className={clsx('flex items-center gap-1 cursor-pointer px-2 py-1 rounded-full border-1 border-foreground/25',
                            {
                                'bg-sky-500 border-sky-500': showFinals,
                            }
                        )}
                        onClick={toggleShowFinals}
                    >
                        <Trophy className="w-4"/>
                        Finals
                    </div>
                    <div
                        className={clsx('flex items-center gap-1 cursor-pointer px-2 py-1 rounded-full border-1 border-foreground/25',
                            {
                                'bg-sky-500 border-sky-500': showThisWeek,
                            }
                        )}
                        onClick={toggleShowThisWeek}
                    >
                        <Calendar className="w-4"/>
                        This week
                    </div>
                </div>
            </div>

            {/* Show past button */}
            {!showPast && <div
                className="w-fit flex items-center gap-2 mx-auto my-2 cursor-pointer rounded-full bg-background dark:bg-foreground/10 px-4 py-2 shadow"
                onClick={showPastEvents}
            >
                <ArrowUp className="w-4"/>
                <div>Show past</div>
            </div>}

            {/* Events */}
            {displayedEvents.length > 0 && displayedEvents.map((event, index) => (
                // add header at the beginning of each month
                <div key={`event-${index}`} className="flex flex-col gap-2">
                    {(index === 0 || event.dateTimeCet.substring(5, 7) != displayedEvents[index - 1].dateTimeCet.substring(5, 7))
                        && <div className="text-lg font-bold">
                            {new Intl.DateTimeFormat('en-GB', {
                                timezone: 'Europe/Vienna',
                                month: 'long'
                            }).format(new Date(event.dateTimeCet))}
                        </div>
                    }
                    <EventCard event={event}/>
                </div>
            ))}

            {/* No events to show (based on constraining filters) */}
            {displayedEvents.length === 0 && showThisWeek && <div className="mt-3 flex flex-col gap-3 text-center">
                <div className="text-3xl">No event to show :(</div>
                <div>Try disabling one of your filters to broaden your search{showPast ? <>.</> : <>, or expand your
                    search to past events by clicking the "Show past" button above</>}</div>
            </div>}

            {/* No more events to show */}
            {baseEvents.length === 0 && events.length > 0 && !showThisWeek &&
                <div className="mt-3 flex flex-col gap-3 text-center">
                    <div className="text-3xl">No show left! :(</div>
                    <div>There is no scheduled Eurovision national final show left this season. Come back later (or
                        browse this season's past shows by clicking the "Show past" button above)!
                    </div>
                </div>}

            {/* No events to show yet */}
            {baseEvents.length === 0 && events.length === 0 && !showThisWeek &&
                <div className="mt-3 flex flex-col gap-3 text-center">
                    <div className="text-3xl">No show yet! :(</div>
                    <div>There is no scheduled Eurovision national final show yet this season. Come back later!</div>
                </div>}

        </div>
    );
}