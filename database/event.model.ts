import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Interface representing the Event document in MongoDB.
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  isDemo?: boolean;
  isPermanent?: boolean;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: [true, 'Description is required'] },
    overview: { type: String, required: [true, 'Overview is required'] },
    image: { type: String, required: [true, 'Image URL is required'] },
    venue: { type: String, required: [true, 'Venue is required'] },
    location: { type: String, required: [true, 'Location is required'] },
    date: { type: String, required: [true, 'Date is required'] },
    time: { type: String, required: [true, 'Time is required'] },
    mode: { type: String, required: [true, 'Mode is required'] },
    audience: { type: String, required: [true, 'Audience is required'] },
    agenda: { type: [String], required: [true, 'Agenda is required'] },
    organizer: { type: String, required: [true, 'Organizer is required'] },
    tags: { type: [String], required: [true, 'Tags are required'] },
    isDemo: { type: Boolean, default: false },
    isPermanent: { type: Boolean, default: false },
    sessionId: { type: String, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// TTL index for demo data - expires after 24 hours
eventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400, partialFilterExpression: { isDemo: true, isPermanent: { $ne: true } } });

/**
 * Pre-save hook for slug generation, date normalization, and validation.
 */
eventSchema.pre('save', function () {
  const event = this as IEvent;
  // Generate slug from title if title is modified or slug is missing
  if (event.isModified('title') || !event.slug) {
    event.slug = event.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Normalize date to ISO format if provided
  if (event.date) {
    const parsedDate = new Date(event.date);
    if (!isNaN(parsedDate.getTime())) {
      event.date = parsedDate.toISOString().split('T')[0]; // Store as YYYY-MM-DD
    } else {
      throw new Error('Invalid date format');
    }
  }

  // Basic time format normalization (ensuring it's not empty)
  if (event.time) {
    event.time = event.time.trim();
  }
});

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

export default Event;
