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
      from: "Collectif Website <onboarding@resend.dev>",
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
    
    console.log("Email sent successfully:", data?.id);

    return NextResponse.json(
      { message: "Message sent successfully" },
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
