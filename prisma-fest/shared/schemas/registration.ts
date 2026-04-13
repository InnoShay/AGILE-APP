import { z } from 'zod';

const TicketTypeEnum = z.enum(['general', 'vip']);

/** Create registration schema */
export const createRegistrationSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  ticketType: TicketTypeEnum.default('general'),
});

/** Check-in schema */
export const checkinSchema = z.object({
  qrToken: z.string().min(1, 'QR token is required'),
});

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type CheckinInput = z.infer<typeof checkinSchema>;
export { TicketTypeEnum };
