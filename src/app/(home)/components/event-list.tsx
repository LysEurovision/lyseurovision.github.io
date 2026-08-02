'use client';

import { Event } from '../../model/event';
import { use, useState } from 'react';
import EventCard from '@/app/(home)/components/event-card';
import { ArrowUp, Calendar, Trophy } from 'lucide-react';
import { clsx } from 'clsx';

export default function EventList({loadedEvents}: { loadedEvents: Promise<Omit<Event, 'past' | 'live'>> }) {
    const formatter = new Intl.DateTimeFormat('sv-SE', {
        timezone: 'Europe/Vienna',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    });
    const nowStr = formatter.format(new Date()).replace(' ', 'T');
    const events: Event[] = (use(loadedEvents) as Omit<Event, 'past'>[]).map(e => ({
        ...e,
        past: e.endDateTimeCet < nowStr,
        // live: e.dateTimeCet >= nowStr && e.endDateTimeCet <= nowStr,
        live: true,
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

    function eventFilterPredicate(event: Event, showFinals: boolean, showThisWeek: boolean): boolean {
        return (!showFinals ? true : event.stage === 'Final' || event.stage === 'Eurovision Night')
            && (!showThisWeek ? true : true);
    }

    const toggleShowFinals = () => {
        setDisplayedEvents(baseEvents.filter(event => eventFilterPredicate(event, !showFinals, showThisWeek)));
        setShowFinals(!showFinals);
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
                                'bg-foreground/10': showFinals,
                            }
                        )}
                        onClick={toggleShowFinals}
                    >
                        <Trophy className="w-4"/>
                        Finals
                    </div>
                    <div
                        className="flex items-center gap-1 cursor-pointer px-2 py-1 rounded-full border-1 border-foreground/25">
                        <Calendar className="w-4"/>
                        This week
                    </div>
                </div>
            </div>

            {/* Show past button */}
            {!showPast && <div
                className="w-fit flex items-center gap-1 mx-auto my-2 cursor-pointer rounded-full bg-background dark:bg-foreground/10 px-4 py-2 shadow-md"
                onClick={showPastEvents}
            >
                <ArrowUp className="w-6"/>
                <div>Show past</div>
            </div>}

            {/* Events */}
            {displayedEvents.length > 0 && <div className="flex flex-col gap-2">
                {displayedEvents.map((event, index) => (
                    // add header at the beginning of each month
                    <>
                        {(index === 0 || event.dateTimeCet.substring(5, 7) != displayedEvents[index - 1].dateTimeCet.substring(5, 7))
                            && <div className="text-lg font-bold">
                                { new Intl.DateTimeFormat('en-GB', { timezone: 'Europe/Vienna', month: 'long' }).format(new Date(event.dateTimeCet)) }
                            </div>
                        }
                        <EventCard event={event}/>
                    </>
                ))}
            </div>}

            {/* No events to show (based on constraining filters) */}
            {displayedEvents.length === 0 && showThisWeek && <div className="flex flex-col gap-3 text-center">
                <div className="text-3xl">No event to show :(</div>
                <div>Try disabling one of your filters</div>
            </div>}

            {/* No more events to show */}
            {baseEvents.length === 0 && events.length > 0 && !showThisWeek &&
                <div className="flex flex-col gap-3 text-center">
                    <div className="text-3xl">No show left! :(</div>
                    <div>There is no scheduled Eurovision national final show left this season. Come back later (or
                        browse this season's past shows by clicking the "Show past" button above)!
                    </div>
                </div>}

            {/* No events to show yet */}
            {baseEvents.length === 0 && events.length === 0 && !showThisWeek &&
                <div className="flex flex-col gap-3 text-center">
                    <div className="text-3xl">No show yet! :(</div>
                    <div>There is no scheduled Eurovision national final show yet this season. Come back later!</div>
                </div>}

        </div>
    );
}