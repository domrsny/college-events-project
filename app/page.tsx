import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import {IEvent} from "@/database/event.model";
import {cacheLife} from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {
    'use cache';
cacheLife('minutes')
    let events = [];
    try {
        const response = await fetch(`${BASE_URL}/api/events`);
        if (!response.ok) {
            console.error('Failed to fetch events:', response.status);
        } else {
            const data = await response.json();
            events = data.events ?? [];
        }
    } catch (error) {
        console.error('Error fetching events:', error);
    }

    return (
        <section>
            <h1 className="text-center">The Hub for Every Student <br /> Event You Can't Miss</h1>
            <p className="text-center mt-5">Socials, Festivals, Game Nights, and More, All in One Place</p>

            <ExploreBtn />

            <div className="mt-20 space-y-7">
                <h3>Featured Events</h3>

                    <ul className="events">
                        {events && events.length > 0 && events.map((event: IEvent) => (
                            <li key={event.title}>
                                <EventCard {...event}/>
                            </li>
                        ))}
                    </ul>
            </div>
        </section>
    )
}
export default Page
