import nodemailer from 'nodemailer'
import { config } from '../config/env.js'
import { logger } from '../config/logger.js'

export interface ContactFormData {
  name: string
  email: string
  company?: string
  message: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  private initializeTransporter() {
    if (!this.transporter) {
      // Hostinger SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })

      logger.info('✅ Email transporter initialized')
    }

    return this.transporter
  }

  async sendContactFormEmail(data: ContactFormData): Promise<boolean> {
    try {
      const transporter = this.initializeTransporter()

      const mailOptions = {
        from: `"RiseRoutes Contact Form" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL || 'contact@riseroutes.com',
        replyTo: data.email,
        subject: `New Contact Form Submission from ${data.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Contact Form Submission</h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
              ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ''}
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #334155;">Message:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${data.message}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #64748b; font-size: 12px;">
              This email was sent from the RiseRoutes contact form.
            </p>
          </div>
        `,
        text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
${data.company ? `Company: ${data.company}` : ''}

Message:
${data.message}

---
This email was sent from the RiseRoutes contact form.
        `
      }

      const info = await transporter.sendMail(mailOptions)
      logger.info(`✅ Contact form email sent: ${info.messageId}`)
      return true
    } catch (error) {
      logger.error('❌ Failed to send contact form email:', error)
      return false
    }
  }

  async sendAutoReplyEmail(data: ContactFormData): Promise<boolean> {
    try {
      const transporter = this.initializeTransporter()

      const mailOptions = {
        from: `"RiseRoutes" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: 'Thank you for contacting RiseRoutes',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Thank You for Reaching Out!</h2>
            
            <p>Hi ${data.name},</p>
            
            <p>Thank you for contacting RiseRoutes. We've received your message and will get back to you as soon as possible.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #334155; margin-top: 0;">Your Message:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${data.message}</p>
            </div>

            <p>In the meantime, feel free to explore our AI-powered ads intelligence platform:</p>
            
            <a href="https://riseroutes.com/analyze" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 10px 0;">
              Analyze Your Website
            </a>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #64748b; font-size: 12px;">
              Best regards,<br>
              Abhisekh Ranjan<br>
              Founder & Product Architect<br>
              RiseRoutes
            </p>
          </div>
        `,
        text: `
Hi ${data.name},

Thank you for contacting RiseRoutes. We've received your message and will get back to you as soon as possible.

Your Message:
${data.message}

In the meantime, feel free to explore our AI-powered ads intelligence platform at https://riseroutes.com/analyze

Best regards,
Abhisekh Ranjan
Founder & Product Architect
RiseRoutes
        `
      }

      const info = await transporter.sendMail(mailOptions)
      logger.info(`✅ Auto-reply email sent: ${info.messageId}`)
      return true
    } catch (error) {
      logger.error('❌ Failed to send auto-reply email:', error)
      return false
    }
  }
}

export const emailService = new EmailService()
