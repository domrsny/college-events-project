import { describe, it, expect } from 'vitest';
import { Types } from 'mongoose';
import { serializeEvent, type EventLean } from './serialize';

describe('serializeEvent', () => {
  it('converts _id and dates to strings', () => {
    const id = new Types.ObjectId();
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');

    const event = {
      _id: id,
      title: 'Test Event',
      slug: 'test-event',
      createdAt,
      updatedAt,
    } as EventLean;

    const result = serializeEvent(event);

    expect(result._id).toBe(id.toString());
    expect(typeof result._id).toBe('string');
    expect(result.createdAt).toBe(createdAt.toISOString());
    expect(result.updatedAt).toBe(updatedAt.toISOString());
    expect(result.title).toBe('Test Event');
  });
});
