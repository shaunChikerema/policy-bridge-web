// src/app/api/payments/payslips/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Type definitions
interface PayslipCreateData {
  client_id: string;
  payment_id?: string;
  policy_id?: string;
  claim_id?: string;
  payslip_type: string;
  amount: number;
  currency: string;
  template_id?: string;
  payslip_details: Record<string, unknown>;
  due_date?: string;
  payment_date?: string;
  transaction_reference?: string;
  external_reference?: string;
  description?: string;
  notes?: string;
  auto_email?: boolean;
  email_recipients?: string[];
  tags?: string[];
}

interface PayslipUpdateData {
  payslip_type?: string;
  amount?: number;
  currency?: string;
  template_id?: string;
  payslip_details?: Record<string, unknown>;
  due_date?: string;
  payment_date?: string;
  transaction_reference?: string;
  external_reference?: string;
  description?: string;
  notes?: string;
  status?: string;
  tags?: string[];
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build query with filters
    let query = supabase
      .from("payslips")
      .select(
        `
        *,
        client:clients!payslips_client_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        payment:payments!payslips_payment_id_fkey (
          id,
          payment_reference,
          amount,
          currency,
          payment_type,
          status
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
      `,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    // Apply filters
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const payslip_type = searchParams.get("payslip_type");
    const client_id = searchParams.get("client_id");
    const payment_id = searchParams.get("payment_id");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    if (search) {
      query = query.or(
        `payslip_reference.ilike.%${search}%,description.ilike.%${search}%,transaction_reference.ilike.%${search}%`
      );
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (payslip_type && payslip_type !== "all") {
      query = query.eq("payslip_type", payslip_type);
    }

    if (client_id) {
      query = query.eq("client_id", client_id);
    }

    if (payment_id) {
      query = query.eq("payment_id", payment_id);
    }

    if (date_from) {
      query = query.gte("created_at", date_from);
    }

    if (date_to) {
      query = query.lte("created_at", date_to);
    }

    const { data: payslips, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch payslips" },
        { status: 500 }
      );
    }

    // Add full_name to client data
    const payslipsWithFullName = payslips?.map((payslip) => ({
      ...payslip,
      client: payslip.client
        ? {
            ...payslip.client,
            full_name:
              `${payslip.client.first_name} ${payslip.client.last_name}`.trim(),
          }
        : null,
    }));

    return NextResponse.json({
      data: payslipsWithFullName || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
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

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: PayslipCreateData = await request.json();

    // Validation
    if (
      !body.client_id ||
      !body.payslip_type ||
      !body.amount ||
      !body.payslip_details
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: client_id, payslip_type, amount, payslip_details",
        },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be positive" },
        { status: 400 }
      );
    }

    // Verify client belongs to user
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", body.client_id)
      .eq("user_id", user.id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Client not found or access denied" },
        { status: 404 }
      );
    }

    // Verify payment belongs to user and client (if provided)
    if (body.payment_id) {
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .select("id, client_id")
        .eq("id", body.payment_id)
        .eq("user_id", user.id)
        .single();

      if (paymentError || !payment || payment.client_id !== body.client_id) {
        return NextResponse.json(
          { error: "Payment not found or doesn't belong to client" },
          { status: 400 }
        );
      }
    }

    // Verify policy belongs to user and client (if provided)
    if (body.policy_id) {
      const { data: policy, error: policyError } = await supabase
        .from("policies")
        .select("id, client_id")
        .eq("id", body.policy_id)
        .eq("user_id", user.id)
        .single();

      if (policyError || !policy || policy.client_id !== body.client_id) {
        return NextResponse.json(
          { error: "Policy not found or doesn't belong to client" },
          { status: 400 }
        );
      }
    }

    // Verify claim belongs to user and client (if provided)
    if (body.claim_id) {
      const { data: claim, error: claimError } = await supabase
        .from("claims")
        .select("id, client_id")
        .eq("id", body.claim_id)
        .eq("user_id", user.id)
        .single();

      if (claimError || !claim || claim.client_id !== body.client_id) {
        return NextResponse.json(
          { error: "Claim not found or doesn't belong to client" },
          { status: 400 }
        );
      }
    }

    // Verify template belongs to user (if provided)
    if (body.template_id) {
      const { data: template, error: templateError } = await supabase
        .from("payslip_templates")
        .select("id")
        .eq("id", body.template_id)
        .eq("user_id", user.id)
        .single();

      if (templateError || !template) {
        return NextResponse.json(
          { error: "Template not found or access denied" },
          { status: 400 }
        );
      }
    }

    // Generate payslip reference
    const payslipRef = `PS-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Validate payslip_type against allowed values
    const validPayslipTypes = [
      "premium_receipt",
      "claim_settlement",
      "refund_receipt",
      "adjustment_receipt",
      "commission_statement",
      "custom",
    ];
    if (!validPayslipTypes.includes(body.payslip_type)) {
      return NextResponse.json(
        { error: "Invalid payslip type" },
        { status: 400 }
      );
    }

    // Prepare payslip data
    const payslipData = {
      user_id: user.id,
      client_id: body.client_id,
      payment_id: body.payment_id || null,
      policy_id: body.policy_id || null,
      claim_id: body.claim_id || null,
      template_id: body.template_id || null,
      payslip_reference: payslipRef,
      payslip_type: body.payslip_type,
      amount: body.amount,
      currency: body.currency || "USD",
      payslip_details: body.payslip_details,
      status: "draft", // Default status
      due_date: body.due_date || null,
      payment_date: body.payment_date || null,
      transaction_reference: body.transaction_reference || null,
      external_reference: body.external_reference || null,
      description: body.description || null,
      notes: body.notes || null,
      tags: body.tags || [],
      auto_email: body.auto_email || false,
      email_recipients: body.email_recipients || [],
    };

    // Create payslip
    const { data: payslip, error } = await supabase
      .from("payslips")
      .insert(payslipData)
      .select(
        `
        *,
        client:clients!payslips_client_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        payment:payments!payslips_payment_id_fkey (
          id,
          payment_reference,
          amount,
          currency,
          payment_type,
          status
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

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to create payslip" },
        { status: 500 }
      );
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

    // TODO: If auto_email is true, trigger email sending
    // if (body.auto_email && body.email_recipients?.length) {
    //   await sendPayslipEmail(payslipWithFullName, body.email_recipients);
    // }

    return NextResponse.json({
      data: payslipWithFullName,
      message: "Payslip created successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const payslipId = searchParams.get("id");

    if (!payslipId) {
      return NextResponse.json(
        { error: "Payslip ID is required" },
        { status: 400 }
      );
    }

    const body: PayslipUpdateData = await request.json();

    // Verify payslip belongs to user
    const { data: existingPayslip, error: fetchError } = await supabase
      .from("payslips")
      .select("id, client_id")
      .eq("id", payslipId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingPayslip) {
      return NextResponse.json(
        { error: "Payslip not found or access denied" },
        { status: 404 }
      );
    }

    // Validate amount if provided
    if (body.amount !== undefined && body.amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be positive" },
        { status: 400 }
      );
    }

    // Validate payslip_type if provided
    if (body.payslip_type) {
      const validPayslipTypes = [
        "premium_receipt",
        "claim_settlement",
        "refund_receipt",
        "adjustment_receipt",
        "commission_statement",
        "custom",
      ];
      if (!validPayslipTypes.includes(body.payslip_type)) {
        return NextResponse.json(
          { error: "Invalid payslip type" },
          { status: 400 }
        );
      }
    }

    // Verify template belongs to user (if provided)
    if (body.template_id) {
      const { data: template, error: templateError } = await supabase
        .from("payslip_templates")
        .select("id")
        .eq("id", body.template_id)
        .eq("user_id", user.id)
        .single();

      if (templateError || !template) {
        return NextResponse.json(
          { error: "Template not found or access denied" },
          { status: 400 }
        );
      }
    }

    // Update payslip
    const { data: payslip, error } = await supabase
      .from("payslips")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payslipId)
      .eq("user_id", user.id)
      .select(
        `
        *,
        client:clients!payslips_client_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        payment:payments!payslips_payment_id_fkey (
          id,
          payment_reference,
          amount,
          currency,
          payment_type,
          status
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

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update payslip" },
        { status: 500 }
      );
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
