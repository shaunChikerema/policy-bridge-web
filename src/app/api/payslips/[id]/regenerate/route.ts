// src/app/api/payments/payslips/[id]/regenerate/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

    // Get current payslip to validate ownership
    const { data: existingPayslip, error: fetchError } = await supabase
      .from("payslips")
      .select("id, status, payslip_reference")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingPayslip) {
      return NextResponse.json({ error: "Payslip not found" }, { status: 404 });
    }

    // Check if payslip can be regenerated (not already sent to avoid confusion)
    if (existingPayslip.status === "sent") {
      return NextResponse.json(
        {
          error:
            "Cannot regenerate a payslip that has already been sent. Create a new payslip instead.",
        },
        { status: 400 }
      );
    }

    // Regenerate payslip (clear PDF data and update timestamps)
    const { data: updatedPayslip, error: updateError } = await supabase
      .from("payslips")
      .update({
        pdf_url: null, // Clear existing PDF URL
        pdf_generated_at: new Date().toISOString(),
        status: "generated",
        updated_at: new Date().toISOString(),
        // Reset download and email tracking for regenerated payslip
        download_count: 0,
        downloaded_at: null,
        email_sent_at: null,
        email_sent_to: null,
        email_count: 0,
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select(
        `
        *,
        payment:payments!payslips_payment_id_fkey (
          id,
          payment_reference,
          payment_type,
          amount,
          currency,
          payment_method,
          status,
          payment_date
        ),
        client:clients!payslips_client_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        policy:policies!payslips_policy_id_fkey (
          id,
          policy_number,
          policy_name,
          policy_type,
          coverage_amount
        ),
        claim:claims!payslips_claim_id_fkey (
          id,
          claim_number,
          claim_type,
          status
        ),
        template:payslip_templates!payslips_template_id_fkey (
          id,
          name,
          template_type
        )
      `
      )
      .single();

    if (updateError || !updatedPayslip) {
      console.error("Regeneration error:", updateError);
      return NextResponse.json(
        { error: "Failed to regenerate payslip" },
        { status: 500 }
      );
    }

    // Add full_name to client data
    const payslipWithFullName = {
      ...updatedPayslip,
      client: updatedPayslip.client
        ? {
            ...updatedPayslip.client,
            full_name:
              `${updatedPayslip.client.first_name} ${updatedPayslip.client.last_name}`.trim(),
          }
        : null,
    };

    // Log the regeneration activity (optional - for audit trail)
    try {
      await supabase
        .from("payslip_activity_log")
        .insert({
          payslip_id: params.id,
          user_id: user.id,
          action: "regenerated",
          details: {
            previous_status: existingPayslip.status,
            regenerated_at: new Date().toISOString(),
          },
        })
        .select()
        .single();
    } catch (logError) {
      // Ignore logging errors - don't fail the main operation
      console.log(
        "Activity logging failed, but payslip regeneration succeeded:",
        logError
      );
    }

    return NextResponse.json({
      data: payslipWithFullName,
      message: `Payslip ${existingPayslip.payslip_reference} regenerated successfully`,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
