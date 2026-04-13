import { z } from 'zod';

const EventCategoryEnum = z.enum([
  'technical', 'cultural', 'sports', 'workshop', 'gaming',
  'arts', 'music', 'dance', 'literary', 'other',
]);

const EventStatusEnum = z.enum(['upcoming', 'live', 'completed', 'cancelled']);

/** Create event schema */
export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: EventCategoryEnum,
  venue: z.string().min(2, 'Venue is required'),
  date: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
  time: z.string().min(1, 'Time is required'),
  totalCapacity: z.number().int().min(1, 'Capacity must be at least 1'),
  isFree: z.boolean(),
  price: z.number().min(0).optional(),
  coverImage: z.string().url().optional(),
});

/** Update event schema */
export const updateEventSchema = createEventSchema.partial().extend({
  status: EventStatusEnum.optional(),
});

/** Event filter/query schema */
export const eventFilterSchema = z.object({
  category: EventCategoryEnum.optional(),
  status: EventStatusEnum.optional(),
  search: z.string().optional(),
  isFree: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['date', 'popularity', 'price']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventFilterInput = z.infer<typeof eventFilterSchema>;
export { EventCategoryEnum, EventStatusEnum };
