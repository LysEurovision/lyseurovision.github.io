const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] ' +
    'before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-700/60 before:to-transparent';

export default function CalendarSkeleton() {
    return (<div className="flex flex-col gap-2">
        <div className={`${shimmer} relative overflow-hidden w-20 h-5 bg-foreground/10 rounded`}></div>

        <div className="flex flex-col gap-1">

        </div>
    </div>);
}