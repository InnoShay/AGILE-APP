import { z } from 'zod';

const AnnouncementPriorityEnum = z.enum(['normal', 'urgent']);

/** Create announcement schema */
export const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  body: z.string().min(5, 'Body must be at least 5 characters'),
  priority: AnnouncementPriorityEnum.default('normal'),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export { AnnouncementPriorityEnum };
