'use client';

import Link from "next/link";
import Image from "next/image";
import posthog from 'posthog-js';
import DemoToggle from "./DemoToggle";

const Navbar = () => {
    const handleLogoClick = () => {
        posthog.capture('logo_clicked', {
            location: 'navbar',
        });
    };

    const handleNavClick = (linkName: string) => {
        posthog.capture(`nav_${linkName.toLowerCase().replace(' ', '_')}_clicked`, {
            link_name: linkName,
            location: 'navbar',
        });
    };

    return (
        <header>
            <nav>
                <Link href='/' className="logo" onClick={handleLogoClick}>
                    <Image src="/icons/logo.png" alt="logo" width={24} height={24} />

                    <p>CollegeEvent</p>
                </Link>

                <ul>
                    <Link href='/' onClick={() => handleNavClick('home')}>Home</Link>
                    <Link href='/events/create' onClick={() => handleNavClick('create_event')}>Create Event</Link>
                    <li><DemoToggle /></li>
                </ul>
            </nav>
        </header>
    )
}
export default Navbar
