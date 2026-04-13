/**
 * QR Code generation service.
 * Generates QR codes with signed JWT payloads for secure ticket verification.
 */

import QRCode from 'qrcode';
import { generateQRToken } from '../utils/jwt';
import { logger } from '../utils/logger';

/**
 * Generate a QR code data URL containing a signed JWT token.
 * The JWT contains registrationId, userId, and eventId — preventing forgery.
 */
export async function generateTicketQR(
  registrationId: string,
  userId: string,
  eventId: string,
): Promise<string> {
  try {
    const token = generateQRToken({ registrationId, userId, eventId });
    const qrDataUrl = await QRCode.toDataURL(token, {
      width: 300,
      margin: 2,
      color: {
        dark: '#0A0A0F',
        light: '#F5F0E8',
      },
    });
    logger.info(`🎫 QR code generated for registration: ${registrationId}`);
    return qrDataUrl;
  } catch (error) {
    logger.error('Failed to generate QR code:', error);
    throw error;
  }
}
