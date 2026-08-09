'use client';

import { BackendEvent } from '../../model/event';
import { use, useEffect, useState } from 'react';
import { dateTimeFormatter, FLAG_EMOJIS, getDurationInMinute, getEventDurationInMinutes } from '@/app/(home)/utils';
import { clsx } from 'clsx';
import { Maximize2 } from 'lucide-react';

type CountryToEvents = {
    [country: string]: { time: string, endTime: string, offset: number, duration: number }[];
}

export default function EventChart({loadedEvents}: { loadedEvents: Promise<BackendEvent> }) {
    /**
     * Expand col size by GRID_COL_SHIFT * 2, and shift all col offsets by GRID_COL_SHIFT so that all time markers have room to fit
     */
    const GRID_COL_SHIFT = 6;

    const todayISO = new Date().toISOString().slice(0, 11);
    // const todayISO = '2026-01-31T';
    // const todayISO = '2026-02-28T';
    // const todayISO = '2026-02-14T';
    // const todayISO = '2026-01-17T';
    const countryToEvents: CountryToEvents = (use(loadedEvents) as BackendEvent[])
        .filter(e => e.dateTimeCet >= todayISO + '15:00:00' && e.dateTimeCet <= todayISO + '23:59:59')
        .toSorted((e1, e2) => e1.dateTimeCet.localeCompare(e2.dateTimeCet, "en-GB"))
        .map((e, index, loadedEvents) => {
            const endDateTime = new Date(e.dateTimeCet + "+0100");
            endDateTime.setTime(endDateTime.getTime() + getEventDurationInMinutes(e) * 60_000);
            return {
                time: e.dateTimeCet.substring(11, 16),
                endTime: dateTimeFormatter.format(endDateTime).substring(11, 16),
                country: e.country,
                offset: index === 0 ? 0 : getDurationInMinute(loadedEvents[0].dateTimeCet, e.dateTimeCet),
                duration: getEventDurationInMinutes(e)
            }
        })
        .reduce((out, e) => {
            if (e.country in out) {
                out[e.country].push({
                    time: e.time,
                    endTime: e.endTime,
                    offset: e.offset,
                    duration: e.duration
                });
            } else {
                out[e.country] = [{
                    time: e.time,
                    endTime: e.endTime,
                    offset: e.offset,
                    duration: e.duration
                }];
            }
            return out;
        }, {} as CountryToEvents);

    if (Object.keys(countryToEvents).length < 2) return "";

    const getEventSpan = (e: { offset: number, duration: number }) => {
        return e.offset + e.duration;
    }

    const chartSpanInMinutes = Object.values(countryToEvents).reduce((maxSpan, currentEvents) => {
        const span = currentEvents.reduce((maxEventSpan, currentEvent) => {
            const eventSpan = getEventSpan(currentEvent);
            return eventSpan > maxEventSpan ? eventSpan : maxEventSpan;
        }, 0);
        return span > maxSpan ? span : maxSpan;
    }, 0);

    const firstEventTime = Object.values(countryToEvents)[0][0].time.split(":");
    const chartStartInMinutesOfDay = parseInt(firstEventTime[0]) * 60 + parseInt(firstEventTime[1]);

    const timeMarkers: { col: number, label: string }[] = [];
    let currentHours = parseInt(firstEventTime[0]);

    let offset = chartStartInMinutesOfDay;
    for (; offset <= chartStartInMinutesOfDay + chartSpanInMinutes; offset += 5) {
        if (offset % 60 === 0) {
            if (offset > chartStartInMinutesOfDay) {
                currentHours++;
            }
            timeMarkers.push({ col: ((offset - chartStartInMinutesOfDay) / 5) + 1, label: (currentHours % 24 + "").padStart(2, "0") + ":00"});
        }
    }

    const updateLiveIndicatorOffset = () => {
        const now = new Date();
        const hourMin = dateTimeFormatter.format(now).substring(11, 16).split(':');
        const minutes = parseInt(hourMin[0]) * 60 + parseInt(hourMin[1]);
        if (minutes < chartStartInMinutesOfDay || minutes > chartStartInMinutesOfDay + chartSpanInMinutes) {
            return -1;
        }
        return Math.floor((minutes - chartStartInMinutesOfDay) / 5) + 1;
    };

    const [expanded, setExpanded] = useState(false);
    const [liveIndicatorOffset, setLiveIndicatorOffset] = useState(updateLiveIndicatorOffset());

    useEffect(() => {
        const liveIndicatorUpdateTimer = setInterval(() => {
            setLiveIndicatorOffset(updateLiveIndicatorOffset());
        }, 60_000);
        return () => clearInterval(liveIndicatorUpdateTimer);
    }, []);

    return (
        <div className="w-full flex flex-col gap-2">
            <div className="text-lg font-bold">
                Tonight's schedule
            </div>

            <div className="relative w-full">
                {/* Expand button */}
                {!expanded && <div className="w-full absolute z-10 flex items-center justify-center bottom-0 left-1/2 -translate-x-1/2">
                    <div className="grow border-t-[0.5px] border-foreground/25 mask-alpha mask-l-from-black mask-l-to-transparent"></div>

                    <div
                        className="flex items-center gap-2 rounded-full bg-background dark:bg-neutral-800 py-2 px-3 shadow cursor-pointer"
                        onClick={() => setExpanded(true)}
                    >
                        <Maximize2 className="w-4"/>Show schedule
                    </div>

                    <div className="grow border-t-[0.5px] border-foreground/25 mask-alpha mask-r-from-black mask-r-to-transparent"></div>
                </div>}

                <div
                    className={clsx('bg-background dark:bg-foreground/10 p-3 rounded-xl bg-background dark:bg-neutral-900 border-1 border-foreground/25 dark:border-foreground/10 grid gap-x-0.5 gap-y-1',
                        {
                            'mask-alpha mask-b-from-black mask-b-from-50% mask-b-to-transparent mask-b-to-85% h-[160px]': !expanded
                        }
                    )}
                    style={{
                        gridTemplateColumns: `repeat(${(chartSpanInMinutes/5) + GRID_COL_SHIFT * 2}, minmax(0, 1fr))`,
                        gridTemplateRows: `auto 10px repeat(${Object.keys(countryToEvents).length}, minmax(40px, 1fr)) 10px`,
                    }}
                >

                    { (timeMarkers).map(marker => (
                        <>
                            <div
                                className="flex items-center justify-center text-sm"
                                style={{
                                    gridRowStart: 1,
                                    gridRowEnd: 2,
                                    gridColumnStart: marker.col + GRID_COL_SHIFT,
                                    gridColumnEnd:  marker.col + GRID_COL_SHIFT + 1,
                                }}
                            >
                                {marker.label}
                            </div>
                            <div
                                style={{
                                    gridRowStart: 2,
                                    gridRowEnd: -1,
                                    gridColumnStart: marker.col + GRID_COL_SHIFT,
                                    gridColumnEnd: marker.col + GRID_COL_SHIFT + 1,
                                }}
                            >
                                <div className="w-px h-full border-l-[0.5px] border-foreground/25 mx-auto"></div>
                            </div>
                        </>
                    ))}

                    {Object.entries(countryToEvents).map(([country, events], countryIndex) => (
                        <>
                            { events.map((event, eventIndex) => (
                                <>
                                    {/* duration bar */}
                                    <div
                                        className={clsx('text-center rounded-xl py-2',
                                            {
                                                'bg-gray-300 dark:bg-neutral-700': (event.offset / 5) + (event.duration / 5) + 1 < liveIndicatorOffset,
                                                'bg-sky-500': (event.offset / 5) + 1 <= liveIndicatorOffset && (event.offset / 5) + (event.duration / 5) + 1 >= liveIndicatorOffset,
                                                'bg-sky-300 dark:bg-sky-700': (event.offset / 5) + 1 > liveIndicatorOffset,
                                            }
                                        )}
                                        style={{
                                            gridRowStart: countryIndex + 3,
                                            gridRowEnd: countryIndex + 4,
                                            gridColumnStart: (event.offset / 5) + 1 + GRID_COL_SHIFT,
                                            gridColumnEnd: (event.offset / 5) + (event.duration / 5) + 2 + GRID_COL_SHIFT,
                                        }}
                                    >
                                        {FLAG_EMOJIS[country]}
                                    </div>
                                    {/* start time */}
                                    <div
                                        className="z-5 flex items-center justify-end text-[10.5px] text-foreground/50"
                                        style={{
                                            gridRowStart: countryIndex + 3,
                                            gridRowEnd: countryIndex + 4,
                                            gridColumnStart: (event.offset / 5) + 1,
                                            gridColumnEnd: (event.offset / 5) + GRID_COL_SHIFT + 1,
                                        }}
                                    >
                                        <span className="bg-background dark:bg-neutral-900 py-0.5">
                                            { event.time }
                                        </span>
                                    </div>
                                    {/* end time */}
                                    {(events.length === 1 || eventIndex === events.length - 1 ) &&<div
                                        className="z-5 flex items-center text-[10.5px] text-foreground/50"
                                        style={{
                                            gridRowStart: countryIndex + 3,
                                            gridRowEnd: countryIndex + 4,
                                            gridColumnStart: (event.offset / 5) + (event.duration / 5) + 2 + GRID_COL_SHIFT,
                                            gridColumnEnd: (event.offset / 5) + (event.duration / 5) + 2 + GRID_COL_SHIFT + 1 + GRID_COL_SHIFT,
                                        }}
                                    >
                                        <span className="bg-background dark:bg-neutral-900 py-1">
                                            { event.endTime }
                                        </span>
                                    </div>}
                                </>
                            ))}
                        </>
                    ))}

                    {/* Live indicator*/}
                    { liveIndicatorOffset > -1 &&
                        <>
                            <div
                                style={{
                                    gridRowStart: 2,
                                    gridRowEnd: -1,
                                    gridColumnStart: liveIndicatorOffset + GRID_COL_SHIFT,
                                    gridColumnEnd: liveIndicatorOffset + GRID_COL_SHIFT + 1,
                                }}
                            >
                                <div className="h-full w-[2px] rounded-full bg-foreground mx-auto"></div>
                            </div>

                            <div
                                className="flex items-center justify-center text-sm"
                                style={{
                                    gridRowStart: -1,
                                    gridRowEnd: -1,
                                    gridColumnStart: liveIndicatorOffset + GRID_COL_SHIFT,
                                    gridColumnEnd: liveIndicatorOffset + GRID_COL_SHIFT + 1,
                                }}
                            >
                                <span className="rounded-lg px-2 bg-foreground text-background">NOW</span>
                            </div>
                        </>
                    }
                </div>
            </div>
        </div>
    )
}