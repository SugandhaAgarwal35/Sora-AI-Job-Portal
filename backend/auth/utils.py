from werkzeug.security import generate_password_hash, check_password_hash
import random
import smtplib
from email.mime.text import MIMEText
import os

def hash_password(password):
    return generate_password_hash(password)

def verify_password(password, hashed):
    return check_password_hash(hashed, password)

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(to_email, otp):
    smtp_email = os.environ.get("SMTP_EMAIL")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    
    # If explicitly set in environment, use real SMTP email sending
    if smtp_email and smtp_password:
        try:
            msg = MIMEText(f"Your Sora Job Portal verification OTP is: {otp}")
            msg['Subject'] = 'Verify your Account'
            msg['From'] = smtp_email
            msg['To'] = to_email
            
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
                smtp_server.login(smtp_email, smtp_password)
                smtp_server.sendmail(smtp_email, to_email, msg.as_string())
            print(f"SMTP OTP Email sent to {to_email}")
        except Exception as e:
            print(f"Failed to send email: {e}, falling back to console.")
            print(f"========== DEVELOPMENT OTP FOR {to_email}: {otp} ==========")
    else:
        # Development fallback
        print("SMTP Credentials not configured in ENV. Logging OTP to console.")
        print(f"========== DEVELOPMENT OTP FOR {to_email}: {otp} ==========")
