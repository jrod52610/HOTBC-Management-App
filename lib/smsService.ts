// SMS Service for handling Twilio integration
import { User } from "@/types";

// Configure environment variables for Twilio integration
// In production, these should be set in your Vercel environment variables
const DEFAULT_TWILIO_ACCOUNT_SID = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID;
const DEFAULT_TWILIO_AUTH_TOKEN = process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN;
const DEFAULT_TWILIO_PHONE_NUMBER = process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER;

// Actual implementation that uses Twilio API
export const sendSMS = async (
  phoneNumber: string,
  message: string,
  sid?: string
): Promise<boolean> => {
  try {
    // Format the phone number to include +1 if not already included
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+1${phoneNumber.replace(/\D/g, '')}`;
    
    // Make an API call to our Next.js API route that will use Twilio
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phoneNumber: formattedPhone, 
        message, 
        sid: sid || DEFAULT_TWILIO_ACCOUNT_SID 
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('SMS API error:', errorData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

// Generate a random temporary password
export const generateTempPassword = (): string => {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send invitation with temporary password
export const sendInvitationWithTempPassword = async (
  phoneNumber: string,
  tempPassword: string,
  sid?: string
): Promise<boolean> => {
  const message = `Welcome to HOTBC Management! Your temporary password is: ${tempPassword}. Please log in and change your password as soon as possible.`;
  return await sendSMS(phoneNumber, message, sid);
};