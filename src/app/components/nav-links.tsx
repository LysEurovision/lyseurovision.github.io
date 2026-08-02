'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

export default function NavLinks() {
    const pathName = usePathname();

    return (
        <div className="flex gap-2">
            <Link
                href={'/'}
                className={clsx('px-1', { 'bg-foreground text-background rounded' : pathName === '/'})}
            >
                Home
            </Link>

            <Link
                href={'/help'}
                className={clsx('px-1', { 'bg-foreground text-background rounded' : pathName === '/help'})}
            >
                Help
            </Link>
        </div>
    );
}