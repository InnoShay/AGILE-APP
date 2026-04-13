import { z } from 'zod';

/** Create feedback schema */
export const createFeedbackSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  rating: z.number().int().min(1, 'Rating must be 1-5').max(5, 'Rating must be 1-5'),
  comment: z.string().max(1000).optional(),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
