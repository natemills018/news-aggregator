import os

import resend

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "onboarding@resend.dev")
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")


def send_verification_email(to_email: str, name: str | None, token: str) -> None:
    """Send a verification email with a confirmation link."""
    verify_url = f"{BASE_URL}/subscribers/verify?token={token}"
    greeting = f"Hi {name}," if name else "Hi,"

    html = f"""
    <div style="max-width:500px;margin:0 auto;font-family:Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="background:#1B2A4A;padding:20px;text-align:center;">
            <h2 style="font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;
                       color:white;margin:0;font-size:20px;letter-spacing:0.02em;">THE CLE BRIEF</h2>
        </div>
        <div style="padding:24px;background:#FFFFFF;">
            <p style="color:#1B2A4A;">{greeting}</p>
            <p style="color:#1B2A4A;">Thanks for subscribing to The CLE Brief! Please confirm your email address to start getting the best events in Cleveland each week:</p>
            <p style="text-align:center;margin:24px 0;">
                <a href="{verify_url}"
                   style="background:#E85D4A;color:white;padding:12px 24px;border-radius:8px;
                          text-decoration:none;font-weight:600;display:inline-block;">
                    Confirm Email
                </a>
            </p>
            <p style="color:#8E95A2;font-size:13px;">Or copy this link: {verify_url}</p>
        </div>
    </div>
    """

    if not RESEND_API_KEY:
        # Dev mode — just log the link
        print(f"[DEV] Verification email for {to_email}: {verify_url}")
        return

    resend.api_key = RESEND_API_KEY
    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": [to_email],
        "subject": "Confirm your CLE Brief subscription",
        "html": html,
    })


def send_digest_email(to_email: str, subject: str, html: str) -> None:
    """Send the weekly digest to a subscriber."""
    if not RESEND_API_KEY:
        print(f"[DEV] Would send digest to {to_email}")
        return

    resend.api_key = RESEND_API_KEY
    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html,
    })
