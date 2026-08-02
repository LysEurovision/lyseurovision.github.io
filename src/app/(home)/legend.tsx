'use client';

import { useEffect, useState } from 'react';
import { Cast, ChevronDown, ChevronUp, GlobeOff, RotateCcw, User } from 'lucide-react';

export default function Legend() {
    const [toggled, setToggled] = useState(false);

    useEffect(() => {
        const displayLegend = localStorage.getItem('display_legend') as 'yes' | 'no';
        if (!displayLegend || displayLegend === 'yes') {
            setToggled(true);
        }
    }, []);

    const toggleLegend = () => {
        localStorage.setItem('display_legend', toggled ? 'no' : 'yes');
        setToggled(!toggled);
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 cursor-pointer" onClick={toggleLegend}>
                <span className="italic">Legend</span>
                { toggled && <ChevronUp className="w-4"/> }
                { !toggled && <ChevronDown className="w-4"/> }
            </div>

            { toggled && <div className="flex flex-col ps-5">
                <div className="flex items-center gap-2">
                    <GlobeOff className="w-5"/>
                    Geoblocked
                </div>
                <div className="flex items-center gap-2">
                    <User className="w-5"/>
                    Account required
                </div>
                <div className="flex items-center gap-2">
                    <RotateCcw className="w-5"/>
                    Replayable
                </div>
                <div className="flex items-center gap-2">
                    <Cast className="w-5"/>
                    Castable
                </div>
            </div> }
        </div>
    );
}