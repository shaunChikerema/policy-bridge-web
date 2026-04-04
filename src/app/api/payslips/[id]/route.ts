// src/app/api/payments/payslips/[id]/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Type definitions
interface PayslipUpdateData {
  template_type?: string;
  description?: string;
  notes?: string;
  custom_fields?: Record<string, unknown>;
  status?: string;
  payslip_details?: Record<string, unknown>;
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

    const { data: payslip, error } = await supabase
      .from("payslips")
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
          payment_date,
          processed_date
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
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !payslip) {
      return NextResponse.json({ error: "Payslip not found" }, { status: 404 });
    }

    // Add full_name to client data
    const payslipWithFullName = {
      ...payslip,
      client: payslip.client
        ? {
            ...payslip.client,
            full_name:
              `${payslip.client.first_name} ${payslip.client.last_name}`.trim(),
          }
        : null,
    };

    return NextResponse.json({ data: payslipWithFullName });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body: PayslipUpdateData = await request.json();

    // Only allow updating certain fields
    const allowedFields = [
      "template_type",
      "description",
      "notes",
      "custom_fields",
      "status",
      "payslip_details",
    ];

    const updateData: Record<string, unknown> = {};

    Object.keys(body).forEach((key) => {
      if (
        allowedFields.includes(key) &&
        body[key as keyof PayslipUpdateData] !== undefined
      ) {
        updateData[key] = body[key as keyof PayslipUpdateData];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Add timestamp for update tracking
    updateData.updated_at = new Date().toISOString();

    const { data: payslip, error } = await supabase
      .from("payslips")
      .update(updateData)
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
        ),
        template:payslip_templates!payslips_template_id_fkey (
          id,
          name,
          template_type
        )
      `
      )
      .single();

    if (error || !payslip) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update payslip" },
        { status: 500 }
      );
    }

    const payslipWithFullName = {
      ...payslip,
      client: payslip.client
        ? {
            ...payslip.client,
            full_name:
              `${payslip.client.first_name} ${payslip.client.last_name}`.trim(),
          }
        : null,
    };

    return NextResponse.json({
      data: payslipWithFullName,
      message: "Payslip updated successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Get payslip to find associated payment
    const { data: payslip } = await supabase
      .from("payslips")
      .select("payment_id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (!payslip) {
      return NextResponse.json({ error: "Payslip not found" }, { status: 404 });
    }

    // Delete the payslip
    const { error: deleteError } = await supabase
      .from("payslips")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete payslip" },
        { status: 500 }
      );
    }

    // Update payment to mark payslip as not generated (if associated with a payment)
    if (payslip.payment_id) {
      await supabase
        .from("payments")
        .update({
          payslip_generated: false,
          payslip_id: null,
        })
        .eq("id", payslip.payment_id);
    }

    return NextResponse.json({
      message: "Payslip deleted successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
