import { Event } from '../../model/event';
import { FLAG_EMOJIS } from '../utils';
import { Cast, ChevronUp, GlobeOff, Hourglass, Play, RotateCcw, User } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function EventCard({event}: { event: Event }) {
    const date = new Date(event.dateTimeCet);
    const timeStr = date.toLocaleString('en-GB', {hour: '2-digit', minute: '2-digit'});
    const durationInMinutes = (new Date(event.endDateTimeCet).getTime() - new Date(event.dateTimeCet).getTime()) / 60_000;

    const [showLinks, setShowLinks] = useState<boolean>(false);

    const shortenLink = (link: string) => {
        return link.replace('https://', '').replace('http://', '').replace('www.', '').split('/', 2)[0];
    }

    const hasLinks: () => boolean = () => {
        return event.past && event.watchLinks.some(l => l.replayable)
            || !event.past && event.watchLinks.some(l => l.live);
    }

    // TODO live rotating border https://play.tailwindcss.com/cc21cCxNJ3

    return (
        <div className="w-full rounded-xl bg-background dark:bg-neutral-900 border-1 border-foreground/10">
            <div className="flex flex-col">
                {/* Card */}
                <div className="flex items-stretch gap-3">
                    <div className="shrink-0 w-10 md:w-15 flex flex-col ml-3 py-3 justify-center items-center">
                        <div className="text-3xl/6 font-bold">{date.toLocaleString('default', {day: '2-digit'})}</div>
                        <div className="text-base">{date.toLocaleString('en-GB', {month: 'short'})}</div>
                        {timeStr !== '00:00' && <div className="mt-1 text-xs/4 text-center">{timeStr} CET</div>}
                        {timeStr !== '00:00' &&
                            <div className="flex items-center gap-0.5 italic text-xs/5 text-foreground/50">
                                <Hourglass className="w-3"/>
                                {Math.floor(durationInMinutes / 60)}h{(durationInMinutes % 60).toString().padEnd(2, '0')}
                            </div>}
                    </div>

                    <div className="shrink-0 w-px my-3 bg-foreground"></div>

                    <div className="grow flex flex-col gap-1 py-3">
                        <div className="">
                            {FLAG_EMOJIS[event.country]} {event.country}
                        </div>
                        <div className="text-xl/5">{event.name}</div>
                        <div className="">{event.stage}</div>
                        <Badge text={event.watchLinks[0]!.channel}/>
                    </div>

                    <div
                        className={clsx('shrink-0 flex items-center cursor-pointer px-5 rounded-r-xl',
                            {
                                'rounded-b-none': showLinks,
                                'bg-foreground/10 text-foreground': !hasLinks(),
                                'bg-sky-500 text-black': hasLinks()
                            }
                        )}
                        onClick={() => setShowLinks(!showLinks)}
                    >
                        {!showLinks && <Play className="w-6"/>}
                        {showLinks && <ChevronUp className="w-6"/>}
                    </div>
                </div>

                {/* Links */}
                {showLinks && <div className="flex flex-col">
                    {(() => {
                        const links = event.past
                            ? event.watchLinks.filter(link => link.replayable === 1)
                            : event.watchLinks.filter(link => link.live === 1);

                        if (links.length === 0) {
                            return <div className="text-center p-3 bg-foreground/10 rounded-b-lg">No watch link available ({event.past ? 'anymore' : 'yet'}?) :(</div>
                        }

                        return <>{links.map((link, index) =>
                            <Link href={link.link} key={`${event.id}-link${index}`}>
                                <div className={clsx('flex items-center gap-2 cursor-pointer px-2 py-3',
                                    {
                                        'bg-sky-500 text-black': (!event.past && link.comment === 'Recommended link') || (event.past && index === 0),
                                        'rounded-b-xl': index === links.length - 1,
                                    }
                                )}
                                >
                                    <span className="font-bold">Link #{index + 1} {link.comment === 'Recommended link' && link.accountRequired === 0 && <span className="hidden md:inline-block">(recommended)</span>}</span>
                                    <span className={clsx('text-sm italic', { 'text-foreground/50': link.comment !== 'Recommended link' && index > 0})}>{shortenLink(link.link)}</span>
                                    <div className="flex items-center shrink-0">
                                        { link.geoblocked === 1 && <GlobeOff className="shrink-0 w-5"/> }
                                        { link.accountRequired === 1 && <User className="shrink-0 w-5"/> }
                                        { link.castable === 1 && <Cast className="shrink-0 w-5"/> }
                                        { link.replayable === 1 && <RotateCcw className="shrink-0 w-5"/> }
                                    </div>
                                    <div className="grow"></div>
                                    { link.accountRequired === 1 && <Link
                                        href={`/help#${event.country}`}
                                        className={clsx('border-1 rounded-lg p-1')}
                                    >
                                        Create account
                                    </Link> }
                                </div>
                            </Link>
                        )}</>
                    })()}
                </div>}
            </div>
        </div>
    );
}

export function Badge({text}: { text: string }) {
    return (
        <div className="w-fit rounded text-xs bg-foreground/10 px-2 py-1">
            {text}
        </div>
    );
}