'use client'

import {useState} from "react";
import {createBooking} from "@/lib/actions/booking.actions";
import posthog from "posthog-js";

const BookEvent = ({ eventId, slug}: {eventId: string, slug: string;}) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { success, error } = await createBooking({eventId, email})

        if(success) {
            setSubmitted(true);
            const isDemoOff = document.cookie.split('; ').find(row => row.startsWith('demo-mode-off='))?.split('=')[1] === 'true';
            const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && !isDemoOff;

            posthog.capture('event_booked', { 
                eventId, 
                slug, 
                email,
                is_demo: isDemo,
            })
        } else {
            console.error('Booking creation failed', error)
            posthog.captureException(typeof error === 'string' ? new Error(error) : error as Error)
        }
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thank you for signing up!</p>
            ): (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            placeholder="Enter your email address"
                        />
                    </div>

                    <button type="submit" className="button-submit">Submit</button>
                </form>
            )}

        </div>
    )
}
export default BookEvent
