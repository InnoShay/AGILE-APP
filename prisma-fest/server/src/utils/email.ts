/**
 * Email utility using Nodemailer for transactional emails.
 * Sends verification, password reset, and notification emails.
 */

import nodemailer from 'nodemailer';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using the configured SMTP transport.
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'PRISMA Fest <noreply@prismafest.com>',
      ...options,
    });
    logger.info(`📧 Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error(`❌ Failed to send email to ${options.to}:`, error);
    // Don't throw — email failure shouldn't break the flow
  }
}

/**
 * Send verification email with token link.
 */
export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendEmail({
    to,
    subject: 'Verify your PRISMA Fest account',
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #F5F0E8; padding: 40px;">
        <h1 style="color: #FF2442; font-size: 36px; margin-bottom: 8px;">PRISMA FEST</h1>
        <p>Hey ${name},</p>
        <p>Welcome to PRISMA Fest 2025! Click the button below to verify your email address.</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #FF2442; color: #F5F0E8; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-weight: bold; margin: 24px 0;">Verify Email</a>
        <p style="color: #888; font-size: 12px; margin-top: 32px;">If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
}

/**
 * Send password reset email with token link.
 */
export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await sendEmail({
    to,
    subject: 'Reset your PRISMA Fest password',
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #F5F0E8; padding: 40px;">
        <h1 style="color: #FF2442; font-size: 36px; margin-bottom: 8px;">PRISMA FEST</h1>
        <p>Hey ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #FF2442; color: #F5F0E8; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-weight: bold; margin: 24px 0;">Reset Password</a>
        <p style="color: #888; font-size: 12px; margin-top: 32px;">This link expires in 1 hour. If you didn't request a reset, ignore this email.</p>
      </div>
    `,
  });
}

/**
 * Send event cancellation email.
 */
export async function sendEventCancelledEmail(to: string, name: string, eventTitle: string): Promise<void> {
  await sendEmail({
    to,
    subject: `Event Cancelled: ${eventTitle}`,
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #F5F0E8; padding: 40px;">
        <h1 style="color: #FF2442; font-size: 36px; margin-bottom: 8px;">PRISMA FEST</h1>
        <p>Hey ${name},</p>
        <p>We're sorry to inform you that <strong>${eventTitle}</strong> has been cancelled.</p>
        <p>If you made a payment, a refund will be processed automatically.</p>
        <p style="margin-top: 24px;">Check out other events at PRISMA Fest!</p>
      </div>
    `,
  });
}
