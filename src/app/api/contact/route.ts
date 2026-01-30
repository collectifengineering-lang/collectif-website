import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}

const subjectLabels: Record<string, string> = {
  "new-project": "New Project Inquiry",
  "consultation": "Consultation Request",
  "partnership": "Partnership Opportunity",
  "careers": "Careers",
  "general": "General Inquiry",
};

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const subjectLabel = subjectLabels[body.subject] || body.subject;

    // Initialize Resend at runtime (not build time) to ensure env var is available
    const apiKey = process.env.RESEND_API_KEY;
    
    // Check if Resend is configured
    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured. Env vars:", Object.keys(process.env).filter(k => k.includes('RESEND')));
      // Log the submission for now so messages aren't lost
      console.log("Contact form submission (email not sent - no API key):", {
        name: body.name,
        email: body.email,
        company: body.company || "N/A",
        subject: subjectLabel,
        message: body.message,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: "Email service not configured. Please contact us directly at connect@collectif.nyc" },
        { status: 503 }
      );
    }

    const resend = new Resend(apiKey);
    
    // Use configured recipient email, or default to connect@collectif.nyc
    // Note: When using onboarding@resend.dev as sender, you can only send to
    // the email address associated with your Resend account until you verify a domain
    const toEmail = process.env.CONTACT_EMAIL || "connect@collectif.nyc";

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "Collectif Website <noreply@collectif.nyc>",
      to: [toEmail],
      replyTo: body.email,
      subject: `Contact Form: ${subjectLabel}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #e91e8c; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #666; width: 120px;">Name:</td>
              <td style="padding: 10px 0; color: #333;">${body.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #666;">Email:</td>
              <td style="padding: 10px 0; color: #333;">
                <a href="mailto:${body.email}" style="color: #e91e8c;">${body.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #666;">Company:</td>
              <td style="padding: 10px 0; color: #333;">${body.company || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #666;">Subject:</td>
              <td style="padding: 10px 0; color: #333;">${subjectLabel}</td>
            </tr>
          </table>
          
          <div style="margin-top: 30px;">
            <h3 style="color: #666; margin-bottom: 10px;">Message:</h3>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; color: #333; line-height: 1.6;">
              ${body.message.replace(/\n/g, "<br>")}
            </div>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #999;">
            Sent from the Collectif website contact form on ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", JSON.stringify(error, null, 2));
      console.error("Attempted to send to:", toEmail);
      return NextResponse.json(
        { error: `Failed to send email: ${error.message}. Please contact us directly at connect@collectif.nyc` },
        { status: 500 }
      );
    }
    
    console.log("Internal notification sent:", data?.id);

    // Send confirmation email to the person who submitted the form
    console.log("Attempting to send confirmation email to:", body.email);
    const { data: confirmationData, error: confirmationError } = await resend.emails.send({
      from: "Collectif <noreply@collectif.nyc>",
      to: [body.email],
      subject: "We've received your message - Collectif",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #e91e8c;">
            <h1 style="margin: 0; color: #333; font-size: 24px;">COLLECTIF</h1>
          </div>
          
          <div style="padding: 40px 20px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hi ${body.name},</p>
            
            <p style="line-height: 1.8; margin-bottom: 20px;">
              Thank you for reaching out to Collectif. We've received your message and appreciate 
              you taking the time to contact us.
            </p>
            
            <p style="line-height: 1.8; margin-bottom: 20px;">
              Our team will review your inquiry and get back to you as soon as possible, 
              typically within 1-2 business days.
            </p>
            
            <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #666;">Your message:</p>
              <p style="margin: 0; color: #555; font-style: italic; line-height: 1.6;">
                "${body.message.length > 200 ? body.message.substring(0, 200) + '...' : body.message}"
              </p>
            </div>
            
            <p style="line-height: 1.8;">
              In the meantime, feel free to explore our work at 
              <a href="https://collectifengineering.com" style="color: #e91e8c;">collectifengineering.com</a>
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding: 30px 20px; text-align: center; color: #999; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">
              <strong style="color: #333;">Collectif Engineering</strong>
            </p>
            <p style="margin: 0 0 5px 0;">New York | San Juan | Miami | New Jersey</p>
            <p style="margin: 0;">
              <a href="mailto:connect@collectif.nyc" style="color: #e91e8c; text-decoration: none;">connect@collectif.nyc</a>
              &nbsp;|&nbsp;
              <a href="tel:+16466100343" style="color: #e91e8c; text-decoration: none;">+1 646.610.0343</a>
            </p>
          </div>
        </div>
      `,
    });

    if (confirmationError) {
      // Log but don't fail - the main message was sent successfully
      console.error("Failed to send confirmation email:", JSON.stringify(confirmationError, null, 2));
      console.error("Confirmation was attempted to:", body.email);
    } else {
      console.log("Confirmation email sent successfully:", confirmationData?.id, "to:", body.email);
    }

    return NextResponse.json(
      { 
        message: "Message sent successfully",
        confirmationSent: !confirmationError,
        confirmationId: confirmationData?.id || null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
