'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

const CreateEventForm = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        overview: "",
        venue: "",
        location: "",
        date: "",
        time: "",
        mode: "",
        audience: "",
        organizer: "",
        tags: "",
        agenda: "",
    });
    const [image, setImage] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'tags' || key === 'agenda') {
                    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item !== "");
                    data.append(key, JSON.stringify(arrayValue));
                } else {
                    data.append(key, value);
                }
            });

            if (image) {
                data.append('image', image);
            } else {
                setError("Image is required");
                setLoading(false);
                return;
            }

            const response = await fetch('/api/events', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();

            if (response.ok) {
                const isDemoOff = document.cookie.split('; ').find(row => row.startsWith('demo-mode-off='))?.split('=')[1] === 'true';
                const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && !isDemoOff;

                posthog.capture('event_created', {
                    title: formData.title,
                    organizer: formData.organizer,
                    slug: result.event.slug,
                    is_demo: isDemo,
                });
                router.push(`/events/${result.event.slug}`);
                router.refresh();
            } else {
                setError(result.message || "Failed to create event");
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="book-event" className="w-full py-10">
            <h1 className="mb-10">Create New Event</h1>
            
            {error && <p className="text-red-500 mb-5">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="title">Event Title</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="Enter event title" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="organizer">Organizer</label>
                        <input type="text" id="organizer" name="organizer" value={formData.organizer} onChange={handleChange} required placeholder="Enter organizer name" />
                    </div>

                    <div className="flex flex-col gap-2 lg:col-span-2">
                        <label htmlFor="description">Short Description</label>
                        <input type="text" id="description" name="description" value={formData.description} onChange={handleChange} required placeholder="Enter a short description" />
                    </div>

                    <div className="flex flex-col gap-2 lg:col-span-2">
                        <label htmlFor="overview">Full Overview</label>
                        <textarea id="overview" name="overview" value={formData.overview} onChange={handleChange} required placeholder="Enter detailed overview" className="bg-dark-200 rounded-[6px] px-5 py-2.5 min-h-[100px] text-white" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="venue">Venue</label>
                        <input type="text" id="venue" name="venue" value={formData.venue} onChange={handleChange} required placeholder="e.g. Main Auditorium" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="location">Location</label>
                        <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Building A, Floor 2" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="date">Date</label>
                        <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className="text-white bg-dark-200" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="time">Time</label>
                        <input type="text" id="time" name="time" value={formData.time} onChange={handleChange} required placeholder="e.g. 10:00 AM - 2:00 PM" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="mode">Mode</label>
                        <select id="mode" name="mode" value={formData.mode} onChange={handleChange} required className="bg-dark-200 rounded-[6px] px-5 py-2.5 text-white">
                            <option value="">Select Mode</option>
                            <option value="In-Person">In-Person</option>
                            <option value="Online">Online</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="audience">Audience</label>
                        <input type="text" id="audience" name="audience" value={formData.audience} onChange={handleChange} required placeholder="e.g. All Students" />
                    </div>

                    <div className="flex flex-col gap-2 lg:col-span-2">
                        <label htmlFor="tags">Tags (comma separated)</label>
                        <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} required placeholder="e.g. Workshop, Tech, Networking" />
                    </div>

                    <div className="flex flex-col gap-2 lg:col-span-2">
                        <label htmlFor="agenda">Agenda (comma separated)</label>
                        <textarea id="agenda" name="agenda" value={formData.agenda} onChange={handleChange} required placeholder="e.g. Intro, Speaker 1, Lunch, Workshop" className="bg-dark-200 rounded-[6px] px-5 py-2.5 min-h-[80px] text-white" />
                    </div>

                    <div className="flex flex-col gap-2 lg:col-span-2">
                        <label htmlFor="image">Event Image</label>
                        <input type="file" id="image" name="image" accept="image/*" onChange={handleFileChange} required className="bg-dark-200 rounded-[6px] px-5 py-2.5 text-white" />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="mt-10 button-submit">
                    {loading ? "Creating..." : "Create Event"}
                </button>
            </form>
        </section>
    );
};

export default CreateEventForm;
