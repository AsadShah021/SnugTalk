import { Resend } from "resend";

import { env } from "./env.js";

/**
 * Transactional email.
 *
 * Deliberately thin. SnugTalk sends a handful of short, plain messages to
 * people who are often having a hard day — there is no campaign tooling here
 * and there shouldn't be.
 */

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends, or throws.
 *
 * Callers decide what a failure means. For a verification code it must surface
 * to the user — telling somebody "check your inbox" when nothing was sent
 * leaves them stuck at a screen they cannot get past.
 */
export async function sendMail({ to, subject, html, text }: Mail): Promise<void> {
  if (!resend) {
    // Development only; env.ts refuses to boot production without a key.
    console.info(`\n📧 [dev] Email to ${to} — ${subject}\n${text}\n`);
    return;
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error(`[mail] send failed to ${to}: ${error.name} — ${error.message}`);
    throw new Error(error.message);
  }
}

/* -------------------------------------------------------------------------- */
/*                                 Templates                                  */
/* -------------------------------------------------------------------------- */

const shell = (heading: string, body: string) => `
<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#f6f6f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c1b1a;">
    <table role="presentation" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:40px 36px;">
      <tr><td>
        <p style="margin:0 0 28px;font-size:17px;font-weight:600;letter-spacing:-0.01em;">SnugTalk</p>
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;letter-spacing:-0.02em;">${heading}</h1>
        ${body}
      </td></tr>
    </table>
    <p style="max-width:480px;margin:20px auto 0;font-size:12px;line-height:1.6;color:#78716c;text-align:center;">
      SnugTalk is a place to be heard. It isn't therapy or crisis care.
    </p>
  </body>
</html>`;

/** The code itself is the whole message — everything else gets out of its way. */
export function verificationEmail(name: string, code: string): Omit<Mail, "to"> {
  const firstName = name.split(" ")[0] ?? name;

  return {
    subject: `${code} is your SnugTalk code`,
    text:
      `Hi ${firstName},\n\n` +
      `Your SnugTalk verification code is ${code}\n\n` +
      `It expires in 10 minutes. If you didn't create an account, you can ignore this email — nothing will happen.\n`,
    html: shell(
      `Hi ${firstName},`,
      `<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#57534e;">
         Here's the code to finish setting up your account.
       </p>
       <p style="margin:0 0 24px;padding:20px;background:#f6f6f5;border-radius:12px;text-align:center;
                 font-size:32px;font-weight:600;letter-spacing:0.22em;font-variant-numeric:tabular-nums;">
         ${code}
       </p>
       <p style="margin:0;font-size:13px;line-height:1.6;color:#78716c;">
         It expires in 10 minutes. If you didn't create an account, you can ignore
         this email — nothing will happen.
       </p>`,
    ),
  };
}

/**
 * Password reset code.
 *
 * Deliberately says what to do if it wasn't you: a reset email nobody asked for
 * is the first sign somebody else knows the address, and the one thing we can
 * usefully tell them is that the password has not changed yet.
 */
export function passwordResetEmail(name: string, code: string): Omit<Mail, "to"> {
  const firstName = name.split(" ")[0] ?? name;

  return {
    subject: `${code} is your SnugTalk reset code`,
    text:
      `Hi ${firstName},\n\n` +
      `Your SnugTalk password reset code is ${code}\n\n` +
      `It expires in 10 minutes. If you didn't ask to reset your password, you can ignore this email — your password has not been changed.\n`,
    html: shell(
      `Hi ${firstName},`,
      `<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#57534e;">
         Here's the code to set a new password.
       </p>
       <p style="margin:0 0 24px;padding:20px;background:#f6f6f5;border-radius:12px;text-align:center;
                 font-size:32px;font-weight:600;letter-spacing:0.22em;font-variant-numeric:tabular-nums;">
         ${code}
       </p>
       <p style="margin:0;font-size:13px;line-height:1.6;color:#78716c;">
         It expires in 10 minutes. If you didn't ask for this, you can ignore this
         email — your password has not been changed.
       </p>`,
    ),
  };
}
