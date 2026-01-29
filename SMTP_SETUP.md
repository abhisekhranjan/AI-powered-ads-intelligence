# SMTP Email Setup Guide (Hostinger)

This guide will help you configure email functionality for the contact form using Hostinger SMTP.

## Prerequisites

- Hostinger hosting account with email service
- Email account created (e.g., contact@riseroutes.com)

## Step 1: Get Your SMTP Credentials from Hostinger

1. Log in to your Hostinger control panel (hPanel)
2. Go to **Emails** section
3. Click on **Manage** next to your email account
4. Find the **Email Configuration** or **SMTP Settings** section
5. Note down these details:
   - **SMTP Server**: `smtp.hostinger.com`
   - **SMTP Port**: `465` (SSL) or `587` (TLS)
   - **Username**: Your full email address (e.g., contact@riseroutes.com)
   - **Password**: Your email password

## Step 2: Configure Backend Environment Variables

1. Open `backend/.env` file (create it from `.env.example` if it doesn't exist)

2. Add these SMTP configuration variables:

```env
# SMTP Configuration (Hostinger)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contact@riseroutes.com
SMTP_PASS=your-email-password-here
CONTACT_EMAIL=contact@riseroutes.com
```

3. Replace the values:
   - `SMTP_USER`: Your Hostinger email address
   - `SMTP_PASS`: Your email password
   - `CONTACT_EMAIL`: Email address where contact form submissions will be sent

## Step 3: Test the Configuration

1. Start your backend server:
```bash
cd backend
npm run dev
```

2. Start your frontend:
```bash
cd frontend
npm run dev
```

3. Go to `http://localhost:5173` and scroll to the contact form
4. Fill out and submit the form
5. Check your email inbox for:
   - Notification email (sent to CONTACT_EMAIL)
   - Auto-reply email (sent to the form submitter)

## Troubleshooting

### Common Issues

**1. Authentication Failed**
- Double-check your email and password
- Make sure you're using the full email address as username
- Try resetting your email password in Hostinger

**2. Connection Timeout**
- Verify SMTP_HOST is `smtp.hostinger.com`
- Try port 587 instead of 465
- Check if your firewall is blocking SMTP ports

**3. Emails Not Sending**
- Check backend logs: `backend/logs/combined.log`
- Verify your Hostinger email account is active
- Make sure you have email sending limits available

**4. Emails Going to Spam**
- Add SPF and DKIM records in Hostinger DNS settings
- Use a verified domain email address
- Avoid spam trigger words in email content

### Testing SMTP Connection

You can test your SMTP connection using this command:

```bash
cd backend
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'your-email@yourdomain.com',
    pass: 'your-password'
  }
});
transporter.verify((error, success) => {
  if (error) console.log('Error:', error);
  else console.log('✅ SMTP connection successful!');
});
"
```

## Email Features

### Notification Email
When someone submits the contact form, you'll receive an email with:
- Sender's name
- Sender's email (set as reply-to)
- Company name (if provided)
- Message content

### Auto-Reply Email
The form submitter will automatically receive:
- Thank you message
- Copy of their submitted message
- Link to analyze their website
- Your contact information

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong email passwords** - Enable 2FA if available
3. **Rotate passwords regularly** - Change email password every 3-6 months
4. **Monitor email logs** - Check for suspicious activity
5. **Set up rate limiting** - Already configured in the backend

## Production Deployment

When deploying to production:

1. Update environment variables on your hosting platform
2. Change `CORS_ORIGIN` to your production domain
3. Update email templates with production URLs
4. Test email delivery in production environment
5. Set up email monitoring and alerts

## Support

If you encounter issues:
- Check Hostinger documentation: https://support.hostinger.com/
- Contact Hostinger support for SMTP-specific issues
- Review backend logs for detailed error messages

## Location Update

The contact information now shows:
- **Location**: Gurgaon, India (updated from San Francisco, CA)
- **Email**: contact@riseroutes.com
- **LinkedIn**: https://www.linkedin.com/in/abhisekhranjan/
