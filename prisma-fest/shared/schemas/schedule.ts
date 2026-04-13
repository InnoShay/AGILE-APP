import { z } from 'zod';

/** Create schedule slot schema */
export const createScheduleSchema = z.object({
  day: z.number().int().min(1).max(5),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  title: z.string().min(2, 'Title is required').max(200),
  stage: z.string().min(1, 'Stage is required'),
  eventId: z.string().optional(),
});

/** Update schedule slot schema */
export const updateScheduleSchema = createScheduleSchema.partial();

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
