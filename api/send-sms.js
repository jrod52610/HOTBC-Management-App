// Vercel Edge Function for sending SMS messages via Twilio
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, body } = req.body;
    
    // Input validation
    if (!to || !body) {
      return res.status(400).json({ error: 'Missing required parameters: to and body' });
    }

    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      console.error('Missing Twilio environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create Twilio client
    const twilio = require('twilio')(accountSid, authToken);
    
    // Send SMS message
    const message = await twilio.messages.create({
      body,
      from: twilioPhone,
      to
    });

    // Return success response with message SID
    return res.status(200).json({ 
      success: true, 
      messageSid: message.sid 
    });
    
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return res.status(500).json({ 
      error: 'Failed to send SMS',
      details: error.message
    });
  }
}