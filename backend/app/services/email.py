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
    <div style="max-width:500px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <div style="background:#ea580c;padding:16px;text-align:center;">
            <h2 style="color:white;margin:0;">CLE Local</h2>
        </div>
        <div style="padding:24px;">
            <p>{greeting}</p>
            <p>Thanks for subscribing to the CLE Local weekly digest! Please confirm your email address:</p>
            <p style="text-align:center;margin:24px 0;">
                <a href="{verify_url}"
                   style="background:#ea580c;color:white;padding:12px 24px;border-radius:8px;
                          text-decoration:none;font-weight:600;display:inline-block;">
                    Confirm Email
                </a>
            </p>
            <p style="color:#888;font-size:13px;">Or copy this link: {verify_url}</p>
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
        "subject": "Confirm your CLE Local subscription",
        "html": html,
    })
