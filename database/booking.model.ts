import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/**
 * Interface representing the Booking document in MongoDB.
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  isDemo?: boolean;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    isDemo: { type: Boolean, default: false },
    sessionId: { type: String, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// TTL index for demo data - expires after 24 hours
bookingSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400, partialFilterExpression: { isDemo: true } }
);

/**
 * Pre-save hook to verify that the referenced Event exists.
 */
bookingSchema.pre('save', async function () {
  const booking = this as IBooking;
  const Event = mongoose.model('Event');
  const eventExists = await Event.exists({ _id: booking.eventId });

  if (!eventExists) {
    throw new Error('Referenced event does not exist');
  }
});

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
