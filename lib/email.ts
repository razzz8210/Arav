import nodemailer from "nodemailer";

const SMTP_SERVER = "smtp.gmail.com";
const SMTP_PORT = 587;
const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const OTP_HTML_TEMPLATE = `
<html>
  <head>
    <style>
      body {
        background-color: #ffffff;
        font-family: Arial, sans-serif;
        color: #333333;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: auto;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        background-color: #fafafa;
      }
      .header {
        text-align: center;
        color: #000000;
      }
      .otp {
        text-align: center;
        margin: 20px 0;
      }
      .otp-code {
        display: inline-block;
        padding: 10px 20px;
        border: 2px dashed #808080;
        font-size: 24px;
        color: #000000;
        letter-spacing: 4px;
      }
      .footer {
        text-align: center;
        color: #808080;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2 class="header">Welcome to Cracked.AI</h2>
      <p style="text-align: center; font-size: 18px;">
        Your One-Time Password (OTP) is:
      </p>
      <div class="otp">
        <span class="otp-code">{otp}</span>
      </div>
      <p class="footer">
        Please use this OTP to complete your verification. The OTP is valid for only 10 minutes.
      </p>
      <p style="color: #000000;">
        Cheers,<br>
        The Cracked.AI Team
      </p>
    </div>
  </body>
</html>
`;

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: SMTP_SERVER,
    port: SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: EMAIL_ADDRESS,
      pass: EMAIL_PASSWORD,
    },
  });
};

export async function sendOTPEmail(
  recipientEmail: string,
  otp: string
): Promise<{ status: boolean; error?: string }> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return { status: false, error: "Invalid email address" };
    }

    const transporter = createTransporter();
    const htmlMessage = OTP_HTML_TEMPLATE.replace("{otp}", otp);

    const mailOptions = {
      from: EMAIL_ADDRESS,
      to: recipientEmail,
      subject: "Cracked.AI OTP Verification",
      html: htmlMessage,
    };

    await transporter.sendMail(mailOptions);
    // console.log(`OTP email sent successfully to ${recipientEmail}`);
    return { status: true };
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return { status: false, error: "Failed to send email" };
  }
}
