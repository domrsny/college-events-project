import EventCard from "@/components/EventCard";
import {IEvent} from "@/database/event.model";
import { getAllEvents } from "@/lib/actions/event.actions";

export const dynamic = 'force-dynamic';

const Page = async () => {
    const events = await getAllEvents();

    return (
        <section>
            <h1 className="text-center">The Hub for Every Student <br /> Event You Can't Miss</h1>
            <p className="text-center mt-5">Socials, Festivals, Game Nights, and More, All in One Place</p>

            <div className="mt-20 space-y-7">
                <h3>Featured Events</h3>

                    <ul className="events">
                        {events && events.length > 0 && events.map((event: IEvent) => (
                            <li key={event.slug}>
                                <EventCard {...event}/>
                            </li>
                        ))}
                    </ul>
            </div>
        </section>
    )
}
export default Page
