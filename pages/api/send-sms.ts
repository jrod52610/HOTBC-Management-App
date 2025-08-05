// Next.js API route to send SMS using Twilio
import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

type RequestData = {
  phoneNumber: string;
  message: string;
  sid?: string;
};

type ResponseData = {
  success: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, message, sid } = req.body as RequestData;
    
    // Validate required fields
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and message are required' 
      });
    }

    // Get Twilio credentials
    const accountSid = sid || process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    // Validate credentials
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return res.status(500).json({ 
        success: false, 
        error: 'Twilio credentials not properly configured' 
      });
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Send the message using Twilio
    const twilioResponse = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    console.log('Twilio message sent with SID:', twilioResponse.sid);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in send-sms API route:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
}