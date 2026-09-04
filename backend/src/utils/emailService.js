// utils/emailService.js
import sgMail from "@sendgrid/mail";

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@alveoly.com";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "Alveoly E-Learning";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// ================= SEND EMAIL HELPER =================
const sendEmail = async (to, subject, html, text = null) => {
  try {
    if (!SENDGRID_API_KEY) {
      console.warn("⚠️ SendGrid API key not configured. Email not sent.");
      return { success: false, error: "SendGrid API key not configured" };
    }

    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Email sending error:", error);
    if (error.response) {
      console.error("SendGrid error details:", error.response.body);
    }
    return { success: false, error: error.message };
  }
};

// ================= SEND APPROVAL EMAIL =================
export const sendApprovalEmail = async (email, name, approvalToken) => {
  const approvalLink = `${process.env.CLIENT_URL}/verify-approval/${approvalToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #1a2a4a;">Alveoly E-Learning</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Welcome to Alveoly, ${name}!</h2>
        
        <p style="color: #555; line-height: 1.6;">
          Thank you for registering as an Alveoly student. Before you can access your account, 
          an administrator needs to approve your registration.
        </p>
        
        <div style="background-color: #f0f4f8; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #333; font-weight: bold;">Your Approval Token:</p>
          <p style="margin: 10px 0 0 0; font-family: monospace; font-size: 18px; color: #0066cc; word-break: break-all;">
            ${approvalToken}
          </p>
        </div>
        
        <p style="color: #555; line-height: 1.6;">
          Click the button below to verify your account (this token expires in 24 hours):
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${approvalLink}" style="display: inline-block; background-color: #2189df; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Verify Account
          </a>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 20px;">
          If you didn't register for an Alveoly account, please ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px 0; color: #888; font-size: 12px;">
        <p>&copy; 2024 Alveoly E-Learning. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendEmail(email, "Alveoly Account Approval Required", html);
};

// ================= SEND APPROVAL CONFIRMATION EMAIL =================
export const sendApprovalConfirmationEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #1a2a4a;">Alveoly E-Learning</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center;">
          <span style="font-size: 48px;">🎉</span>
        </div>
        
        <h2 style="color: #333; text-align: center;">Account Approved!</h2>
        
        <p style="color: #555; line-height: 1.6;">
          Dear ${name},
        </p>
        
        <p style="color: #555; line-height: 1.6;">
          Your Alveoly account has been approved! You can now login and start your learning journey.
        </p>
        
        <p style="color: #555; line-height: 1.6;">
          Here's what you can do now:
        </p>
        
        <ul style="color: #555; line-height: 1.8;">
          <li>Login to your account</li>
          <li>Select your program and courses</li>
          <li>Access learning materials and resources</li>
          <li>Take practice quizzes and exams</li>
          <li>Track your progress</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; background-color: #2189df; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Login Now
          </a>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 20px;">
          If you have any questions, please contact support at support@alveoly.com
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px 0; color: #888; font-size: 12px;">
        <p>&copy; 2024 Alveoly E-Learning. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendEmail(email, "Alveoly Account Approved! 🎉", html);
};

// ================= SEND PLAN EXPIRY NOTIFICATION =================
export const sendPlanExpiryEmail = async (email, name, planTitle, expiryDate) => {
  const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #1a2a4a;">Alveoly E-Learning</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Plan Expiry Notice</h2>
        
        <p style="color: #555; line-height: 1.6;">
          Dear ${name},
        </p>
        
        <p style="color: #555; line-height: 1.6;">
          Your <strong>"${planTitle}"</strong> plan is set to expire on <strong>${formattedDate}</strong>.
        </p>
        
        <p style="color: #555; line-height: 1.6;">
          To continue accessing all your learning materials and resources, please renew your plan.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/student/plans" style="display: inline-block; background-color: #f7c928; color: #222; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Renew Plan
          </a>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 20px;">
          If you have already renewed, please ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px 0; color: #888; font-size: 12px;">
        <p>&copy; 2024 Alveoly E-Learning. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendEmail(email, `Alveoly Plan Expiry Notice - ${planTitle}`, html);
};

// ================= SEND WELCOME EMAIL =================
export const sendWelcomeEmail = async (email, name, userType) => {
  const isAlveolyStudent = userType === "alveoly_student";
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #1a2a4a;">Alveoly E-Learning</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center;">
          <span style="font-size: 48px;">👋</span>
        </div>
        
        <h2 style="color: #333; text-align: center;">Welcome to Alveoly, ${name}!</h2>
        
        <p style="color: #555; line-height: 1.6;">
          Thank you for joining Alveoly E-Learning! We're excited to have you on board.
        </p>
        
        ${isAlveolyStudent ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">
              <strong>Next Steps:</strong> Your account is pending approval. An administrator will review your registration.
              You will receive a confirmation email once your account is approved.
            </p>
          </div>
        ` : `
          <p style="color: #555; line-height: 1.6;">
            As a Non-Alveoly student, you can now browse our subscription plans and choose the one that fits your learning needs.
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.CLIENT_URL}/student/plans" style="display: inline-block; background-color: #f7c928; color: #222; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              View Plans
            </a>
          </div>
        `}
        
        <p style="color: #888; font-size: 12px; margin-top: 20px;">
          If you have any questions, please contact support at support@alveoly.com
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px 0; color: #888; font-size: 12px;">
        <p>&copy; 2024 Alveoly E-Learning. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendEmail(
    email, 
    isAlveolyStudent ? "Welcome to Alveoly - Awaiting Approval" : "Welcome to Alveoly!", 
    html
  );
};

// ================= SEND PASSWORD RESET EMAIL =================
export const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #1a2a4a;">Alveoly E-Learning</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Password Reset Request</h2>
        
        <p style="color: #555; line-height: 1.6;">
          Dear ${name},
        </p>
        
        <p style="color: #555; line-height: 1.6;">
          We received a request to reset your password for your Alveoly account. 
          Click the button below to reset your password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; background-color: #2189df; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 20px;">
          This link will expire in 15 minutes. If you didn't request a password reset, please ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px 0; color: #888; font-size: 12px;">
        <p>&copy; 2024 Alveoly E-Learning. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendEmail(email, "Alveoly Password Reset", html);
};

export default {
  sendApprovalEmail,
  sendApprovalConfirmationEmail,
  sendPlanExpiryEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};