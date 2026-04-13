/**
 * Stripe payment service for PRISMA Fest.
 * Handles payment intents, product creation, and webhook processing.
 */

import Stripe from 'stripe';
import { logger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-04-10' as any,
});

/**
 * Create a Stripe payment intent for event registration.
 */
export async function createPaymentIntent(
  amount: number,
  metadata: { eventId: string; userId: string; registrationId: string },
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paisa/cents
      currency: 'inr',
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    logger.info(`💳 Payment intent created: ${paymentIntent.id}`);
    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    logger.error('Failed to create payment intent:', error);
    throw error;
  }
}

/**
 * Create a Stripe product and price for a paid event.
 */
export async function createStripeProduct(
  eventTitle: string,
  price: number,
): Promise<{ productId: string; priceId: string }> {
  try {
    const product = await stripe.products.create({
      name: `PRISMA Fest: ${eventTitle}`,
    });

    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(price * 100),
      currency: 'inr',
    });

    return { productId: product.id, priceId: stripePrice.id };
  } catch (error) {
    logger.error('Failed to create Stripe product:', error);
    throw error;
  }
}

/**
 * Verify Stripe webhook signature.
 */
export function verifyWebhookSignature(payload: Buffer, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
  );
}

/**
 * Issue a refund for a payment intent.
 */
export async function refundPayment(paymentIntentId: string): Promise<void> {
  try {
    await stripe.refunds.create({ payment_intent: paymentIntentId });
    logger.info(`💳 Refund issued for: ${paymentIntentId}`);
  } catch (error) {
    logger.error(`Failed to refund payment ${paymentIntentId}:`, error);
    throw error;
  }
}

export { stripe };
