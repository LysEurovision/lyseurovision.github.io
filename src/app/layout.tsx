import type { Metadata } from 'next';
import './globals.css';
import Header from '@/app/components/header';
import { ThemeProvider } from '@/app/components/theme-provider';
import { Roboto, Lato } from 'next/font/google';

const roboto = Lato({
    weight: '400',
    // subsets: ['latin', 'cyrillic'],
    variable: '--font-roboto'
})

export const metadata: Metadata = {
    title: 'Lys',
    description: 'TODO',
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html className={`h-full ${roboto.variable}`} lang="en">
            <body className="antialiased w-full h-full">
                <ThemeProvider
                    attribute="data-theme"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="w-full h-full overflow-scroll bg-gray-100 dark:bg-background">
                        <div className="flex flex-col gap-3 md:w-[450px] mx-auto p-3 md:px-0">
                            <Header/>
                            {children}
                        </div>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
