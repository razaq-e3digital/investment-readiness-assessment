import { Buffer } from 'node:buffer';

import { Env } from '@/libs/Env';

export type MailgunSendParams = {
  to: string;
  subject: string;
  html: string;
  recipientVariables?: Record<string, unknown>;
};

export type MailgunSendResult =
  | { success: true; messageId: string }
  | { success: false; status: number; body: string };

export async function sendViaMailgun(params: MailgunSendParams): Promise<MailgunSendResult> {
  const apiKey = Env.MAILGUN_API_KEY;
  const domain = Env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    return { success: false, status: 0, body: 'Mailgun not configured' };
  }

  const { to, subject, html, recipientVariables } = params;

  const formData = new URLSearchParams();
  formData.set('from', 'E3 Digital <info@e3digital.net>');
  formData.set('h:Reply-To', 'razaq@e3.digital');
  formData.set('to', to);
  formData.set('subject', subject);
  formData.set('html', html);

  if (recipientVariables) {
    formData.set('recipient-variables', JSON.stringify(recipientVariables));
  }

  const credentials = Buffer.from(`api:${apiKey}`).toString('base64');

  let response: Response;
  try {
    response = await fetch(`https://api.eu.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, status: 0, body: message };
  }

  if (response.ok) {
    const json = await response.json() as { id: string; message: string };
    return { success: true, messageId: json.id };
  }

  const body = await response.text();
  return { success: false, status: response.status, body };
}
