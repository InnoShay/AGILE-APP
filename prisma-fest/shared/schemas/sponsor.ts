import { z } from 'zod';

const SponsorTierEnum = z.enum(['title', 'gold', 'silver']);

/** Create sponsor schema */
export const createSponsorSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  logoUrl: z.string().url('Must be a valid URL'),
  tier: SponsorTierEnum,
  website: z.string().url().optional(),
});

export type CreateSponsorInput = z.infer<typeof createSponsorSchema>;
export { SponsorTierEnum };
