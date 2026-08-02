import NavLinks from '@/app/components/nav-links';
import ThemeToggle from '@/app/components/theme-toggle';

export default function Header() {
    return (
        <div className="flex flex-col gap-2 items-center">
            <ThemeToggle/>
            <div className="text-[48px]">Lys</div>
            <NavLinks/>
        </div>
    );
}