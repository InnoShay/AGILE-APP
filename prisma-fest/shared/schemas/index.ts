import { z } from 'zod';

/** Standard API response shape */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.object({
      message: z.string(),
      code: z.string(),
    }).optional(),
  });

/** Pagination query params */
export const paginationSchema = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('12').transform((v) => Math.min(Number(v), 50)),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/** Shared index export */
export { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from './auth';
export { createEventSchema, updateEventSchema, eventFilterSchema } from './event';
export { updateUserSchema, changePasswordSchema } from './user';
export { createRegistrationSchema, checkinSchema } from './registration';
export { createFeedbackSchema } from './feedback';
export { createAnnouncementSchema } from './announcement';
export { createSponsorSchema } from './sponsor';
export { createScheduleSchema, updateScheduleSchema } from './schedule';
