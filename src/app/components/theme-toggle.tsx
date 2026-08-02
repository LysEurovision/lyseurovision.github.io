'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const theme = localStorage.getItem('theme') as 'dark' | 'light';
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            setTheme(theme);
        }
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setTheme('light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setTheme('dark');
        }
    }

    if (!mounted) return <div className="size-5 p-2"></div>;

    return (
        <div className="w-full flex justify-end">
            <div
                className={clsx('p-2 cursor-pointer rounded-l-lg border-1 border-r-0 border-foreground/25',
                    {
                        'bg-sky-500 text-white': theme === 'light',
                    }
                )}
                onClick={toggleTheme}
            >
                <Sun className="w-5"/>
            </div>
            <div
                className={clsx('p-2 cursor-pointer rounded-r-lg border-1 border-foreground/25',
                    {
                        'bg-sky-500 text-black': theme === 'dark',
                    }
                )}
                onClick={toggleTheme}
            >
                <Moon className="w-5"/>
            </div>
        </div>
    )
}