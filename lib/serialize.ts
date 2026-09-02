import { Document, Types } from 'mongoose';
import { IEvent } from '@/database/event.model';

export type EventLean = Omit<IEvent, keyof Document> & { _id: Types.ObjectId };

export type SerializedEvent = Omit<EventLean, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

export function serializeEvent(event: EventLean): SerializedEvent {
  return {
    ...event,
    _id: event._id.toString(),
    createdAt: event.createdAt?.toISOString(),
    updatedAt: event.updatedAt?.toISOString(),
  };
}
