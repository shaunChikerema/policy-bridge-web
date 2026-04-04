// src/app/api/payments/payslips/bulk-generate/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface BulkGenerateRequest {
  payment_ids: string[];
  template_type: "default" | "modern" | "corporate" | "minimal" | "branded";
  auto_email?: boolean;
  notes?: string;
}

export async function POST(request: NextRequest) {
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

    const body: BulkGenerateRequest = await request.json();

    // Validation
    if (
      !body.payment_ids ||
      !Array.isArray(body.payment_ids) ||
      body.payment_ids.length === 0
    ) {
      return NextResponse.json(
        { error: "payment_ids array is required and cannot be empty" },
        { status: 400 }
      );
    }

    if (body.payment_ids.length > 50) {
      return NextResponse.json(
        { error: "Cannot generate more than 50 payslips at once" },
        { status: 400 }
      );
    }

    if (!body.template_type) {
      return NextResponse.json(
        { error: "template_type is required" },
        { status: 400 }
      );
    }

    // Validate template type
    const validTemplateTypes = [
      "default",
      "modern",
      "corporate",
      "minimal",
      "branded",
    ];
    if (!validTemplateTypes.includes(body.template_type)) {
      return NextResponse.json(
        { error: "Invalid template_type" },
        { status: 400 }
      );
    }

    // Get all payments and validate they belong to the user
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select(
        `
        id,
        client_id,
        policy_id,
        claim_id,
        payment_reference,
        payment_type,
        amount,
        currency,
        payment_method,
        payment_date,
        client:clients!payments_client_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        policy:policies!payments_policy_id_fkey (
          id,
          policy_number,
          policy_name,
          policy_type,
          coverage_amount
        ),
        claim:claims!payments_claim_id_fkey (
          id,
          claim_number,
          claim_type,
          status
        )
      `
      )
      .eq("user_id", user.id)
      .in("id", body.payment_ids);

    if (paymentsError) {
      console.error("Payments fetch error:", paymentsError);
      return NextResponse.json(
        { error: "Failed to fetch payments" },
        { status: 500 }
      );
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json(
        { error: "No valid payments found" },
        { status: 404 }
      );
    }

    if (payments.length !== body.payment_ids.length) {
      return NextResponse.json(
        { error: "Some payment IDs were not found or don't belong to you" },
        { status: 400 }
      );
    }

    // Check for existing payslips
    const { data: existingPayslips } = await supabase
      .from("payslips")
      .select("payment_id")
      .eq("user_id", user.id)
      .in("payment_id", body.payment_ids);

    if (existingPayslips && existingPayslips.length > 0) {
      const existingPaymentIds = existingPayslips.map((p) => p.payment_id);
      return NextResponse.json(
        {
          error: `Payslips already exist for payment IDs: ${existingPaymentIds.join(
            ", "
          )}`,
          existing_payment_ids: existingPaymentIds,
        },
        { status: 409 }
      );
    }

    // Generate payslips data
    const payslipsData = payments.map((payment) => {
      const payslipRef = `PS-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

      // Handle the case where relations might be arrays or null
      const clientData = Array.isArray(payment.client)
        ? payment.client[0]
        : payment.client;
      const policyData = Array.isArray(payment.policy)
        ? payment.policy[0]
        : payment.policy;
      const claimData = Array.isArray(payment.claim)
        ? payment.claim[0]
        : payment.claim;

      return {
        user_id: user.id,
        client_id: payment.client_id,
        payment_id: payment.id,
        policy_id: payment.policy_id || null,
        claim_id: payment.claim_id || null,
        payslip_reference: payslipRef,
        payslip_type: payment.payment_type || "premium_receipt",
        amount: payment.amount,
        currency: payment.currency || "BWP",
        template_type: body.template_type,
        payment_reference: payment.payment_reference,
        payment_method: payment.payment_method,
        payment_date: payment.payment_date || new Date().toISOString(),
        client_name: clientData
          ? `${clientData.first_name} ${clientData.last_name}`.trim()
          : "Unknown Client",
        client_email: clientData?.email || "",
        policy_number: policyData?.policy_number || null,
        policy_name: policyData?.policy_name || null,
        claim_number: claimData?.claim_number || null,
        status: body.auto_email ? "generated" : "draft",
        description:
          body.notes || `Bulk generated payslip for ${payment.payment_type}`,
        notes: body.notes || null,
        payslip_details: {
          payment_reference: payment.payment_reference,
          payment_type: payment.payment_type,
          payment_method: payment.payment_method,
          bulk_generated: true,
          template_type: body.template_type,
          generated_at: new Date().toISOString(),
        },
        pdf_generated_at: new Date().toISOString(),
        auto_email: body.auto_email || false,
        download_count: 0,
        email_count: 0,
      };
    });

    // Insert payslips in batch
    const { data: createdPayslips, error: insertError } = await supabase
      .from("payslips")
      .insert(payslipsData).select(`
        *,
        payment:payments!payslips_payment_id_fkey (
          id,
          payment_reference,
          payment_type,
          amount,
          currency,
          payment_method,
          status
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
        )
      `);

    if (insertError) {
      console.error("Bulk insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create payslips" },
        { status: 500 }
      );
    }

    // Update payments to mark payslips as generated
    await supabase
      .from("payments")
      .update({
        payslip_generated: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .in("id", body.payment_ids);

    // Add full_name to client data
    const payslipsWithFullName = createdPayslips?.map((payslip) => ({
      ...payslip,
      client: payslip.client
        ? {
            ...payslip.client,
            full_name:
              `${payslip.client.first_name} ${payslip.client.last_name}`.trim(),
          }
        : null,
    }));

    // TODO: If auto_email is true, trigger bulk email sending
    // if (body.auto_email) {
    //   await sendBulkPayslipEmails(payslipsWithFullName);
    // }

    return NextResponse.json({
      data: payslipsWithFullName || [],
      message: `Successfully generated ${
        createdPayslips?.length || 0
      } payslips`,
      summary: {
        total_generated: createdPayslips?.length || 0,
        template_type: body.template_type,
        auto_email: body.auto_email || false,
        generated_at: new Date().toISOString(),
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
