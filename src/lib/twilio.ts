import twilio from "twilio";

let _client: twilio.Twilio | null = null;

function getTwilioClient(): twilio.Twilio | null {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    return null;
  }
  if (!_client) {
    _client = twilio(sid, token);
  }
  return _client;
}

export interface SendSmsParams {
  to: string;
  body: string;
}

export async function sendSms({ to, body }: SendSmsParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const client = getTwilioClient();
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!client || !from) {
      console.log(`[Twilio Mock SMS] To: ${to} | Body: ${body}`);
      return { success: true, messageId: `mock_${Date.now()}` };
    }

    const message = await client.messages.create({
      to,
      from,
      body,
    });

    return { success: true, messageId: message.sid };
  } catch (err) {
    console.error("[Twilio SMS Error]:", err);
    return { success: false, error: String(err) };
  }
}
