// src/app/api/payments/payslips/[id]/download/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Utility function for PDF generation (placeholder)
function generatePayslipPDF(payslip: Record<string, unknown>): Buffer {
  // This is a placeholder - implement with your chosen PDF library
  // Options: Puppeteer, jsPDF, React-PDF, etc.
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

export async function GET(
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

    // Get payslip data with related information
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

    // Generate PDF content
    const pdfContent = generatePayslipPDF({
      ...payslip,
      client_name: payslip.client
        ? `${payslip.client.first_name} ${payslip.client.last_name}`.trim()
        : "Unknown Client",
    });

    // Update download tracking
    const currentDownloadCount = (payslip.download_count as number) || 0;
    await supabase
      .from("payslips")
      .update({
        download_count: currentDownloadCount + 1,
        downloaded_at: new Date().toISOString(),
        status: payslip.status === "draft" ? "downloaded" : payslip.status,
      })
      .eq("id", params.id);

    return new NextResponse(new Uint8Array(pdfContent), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="payslip-${
          payslip.payslip_reference || params.id
        }.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
