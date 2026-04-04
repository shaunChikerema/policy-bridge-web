// src/app/api/payments/payslips/[id]/email/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Type definitions
interface EmailPayslipRequest {
  email?: string;
  subject?: string;
  message?: string;
}

// Utility functions (placeholders - implement with your chosen libraries)
function generatePayslipPDF(payslip: Record<string, unknown>): Buffer {
  const mockPDFContent = Buffer.from(`
    PAYSLIP
    -------
    Payslip Reference: ${payslip.payslip_reference || "N/A"}
    Client: ${payslip.client_name || "N/A"}
    Amount: ${payslip.currency || "USD"} ${payslip.amount || "0.00"}
    Payment Type: ${payslip.payslip_type || "N/A"}
    Payment Date: ${payslip.payment_date || "N/A"}
    Transaction Reference: ${payslip.transaction_reference || "N/A"}
    
    Generated on: ${new Date().toISOString()}
  `);

  return mockPDFContent;
}

async function sendPayslipEmail(
  email: string,
  payslip: Record<string, unknown>,
  pdfContent: Buffer,
  subject?: string,
  message?: string
): Promise<boolean> {
  // This is a placeholder - implement with your email service
  // Options: Nodemailer, SendGrid, AWS SES, Resend, etc.
  console.log(`Sending payslip ${payslip.payslip_reference} to ${email}`);
  console.log(`Subject: ${subject || "Your Payslip"}`);
  console.log(`Message: ${message || "Please find your payslip attached."}`);
  console.log(`PDF size: ${pdfContent.length} bytes`);

  // Simulate email sending with some validation
  if (!email || !email.includes("@")) {
    return false;
  }

  // Simulate async email sending
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000);
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: EmailPayslipRequest = await request.json();

    // Get payslip data with client information
    const { data: payslip, error } = await supabase
      .from("payslips")
      .select(
        `
        *,
        client:clients!payslips_client_id_fkey (
          first_name,
          last_name,
          email
        ),
        payment:payments!payslips_payment_id_fkey (
          payment_reference,
          payment_date
        )
      `
      )
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !payslip) {
      return NextResponse.json({ error: "Payslip not found" }, { status: 404 });
    }

    // Determine email recipient
    const emailTo = body.email || (payslip.client?.email as string);

    if (!emailTo) {
      return NextResponse.json(
        { error: "No email address provided and client has no email on file" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTo)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfContent = generatePayslipPDF({
      ...payslip,
      client_name: payslip.client
        ? `${payslip.client.first_name} ${payslip.client.last_name}`.trim()
        : "Unknown Client",
    });

    // Send email
    const emailSent = await sendPayslipEmail(
      emailTo,
      payslip,
      pdfContent,
      body.subject,
      body.message
    );

    if (emailSent) {
      // Update email tracking
      await supabase
        .from("payslips")
        .update({
          email_sent_at: new Date().toISOString(),
          email_sent_to: emailTo,
          status: payslip.status === "draft" ? "sent" : payslip.status,
          email_count: ((payslip.email_count as number) || 0) + 1,
        })
        .eq("id", params.id);

      return NextResponse.json({
        message: `Payslip sent successfully to ${emailTo}`,
        data: {
          recipient: emailTo,
          sent_at: new Date().toISOString(),
          payslip_reference: payslip.payslip_reference,
        },
      });
    } else {
      return NextResponse.json(
        {
          error:
            "Failed to send email. Please check the email address and try again.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
