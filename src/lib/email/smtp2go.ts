import { Env } from '@/libs/Env';

export type Smtp2goSendParams = {
  to: string;
  subject: string;
  html: string;
};

export type Smtp2goSendResult =
  | { success: true; messageId: string }
  | { success: false; status: number; body: string };

type Smtp2goSuccessResponse = {
  request_id: string;
  data: {
    succeeded: number;
    failed: number;
    failures: string[];
    email_id: string;
  };
};

export async function sendViaSmtp2go(params: Smtp2goSendParams): Promise<Smtp2goSendResult> {
  const apiKey = Env.SMTP2GO_API_KEY;

  if (!apiKey) {
    return { success: false, status: 0, body: 'SMTP2Go not configured' };
  }

  const { to, subject, html } = params;

  const body = {
    sender: 'E3 Digital <info@e3digital.net>',
    to: [to],
    subject,
    html_body: html,
    custom_headers: [
      { header: 'Reply-To', value: 'razaq@e3.digital' },
    ],
  };

  let response: Response;
  try {
    response = await fetch('https://eu-api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, status: 0, body: message };
  }

  if (response.ok) {
    const json = await response.json() as Smtp2goSuccessResponse;
    return { success: true, messageId: json.data.email_id };
  }

  const responseBody = await response.text();
  return { success: false, status: response.status, body: responseBody };
}
