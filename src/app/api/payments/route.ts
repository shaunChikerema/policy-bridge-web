// src/app/api/payments/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface PaymentCreateData {
  client_id: string;
  policy_id?: string;
  claim_id?: string;
  payment_type: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_details?: Record<string, unknown>;
  due_date?: string;
  payment_date?: string;
  transaction_id?: string;
  external_reference?: string;
  description?: string;
  notes?: string;
  tags?: string[];
}

// Payment validation schemas
const VALID_PAYMENT_TYPES = ["premium", "claim_settlement", "refund", "adjustment"];
const VALID_PAYMENT_METHODS = [
  "bank_transfer", "credit_card", "debit_card", "mobile_money", 
  "cash", "cheque", "eft"
];
const VALID_STATUSES = ["pending", "processing", "completed", "failed", "cancelled", "refunded"];

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Build query with filters
    let query = supabase
      .from("payments")
      .select(
        `
        *,
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
      `,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    // Apply filters
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const payment_type = searchParams.get("payment_type");
    const payment_method = searchParams.get("payment_method");
    const date_range = searchParams.get("date_range");

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(
        `payment_reference.ilike.${searchTerm},description.ilike.${searchTerm},transaction_id.ilike.${searchTerm}`
      );
    }

    if (status && VALID_STATUSES.includes(status)) {
      query = query.eq("status", status);
    }

    if (payment_type && VALID_PAYMENT_TYPES.includes(payment_type)) {
      query = query.eq("payment_type", payment_type);
    }

    if (payment_method && VALID_PAYMENT_METHODS.includes(payment_method)) {
      query = query.eq("payment_method", payment_method);
    }

    // Date range filtering
    if (date_range) {
      const now = new Date();
      let startDate = new Date();

      switch (date_range) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }

      if (date_range !== "all") {
        query = query.gte("created_at", startDate.toISOString());
      }
    }

    const { data: payments, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { 
          error: "Failed to fetch payments",
          details: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 500 }
      );
    }

    // Transform data for frontend
    const transformedPayments = payments?.map((payment) => ({
      ...payment,
      client: payment.client ? {
        ...payment.client,
        full_name: `${payment.client.first_name || ''} ${payment.client.last_name || ''}`.trim() || 'Unknown Client',
      } : null,
      // Ensure policy and claim data is properly formatted
      policy: payment.policy || null,
      claim: payment.claim || null,
    })) || [];

    return NextResponse.json({
      data: transformedPayments,
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
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" 
          ? (error instanceof Error ? error.message : "Unknown error")
          : undefined
      },
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: PaymentCreateData;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    console.log("Received payment creation request:", { ...body, user_id: user.id });

    // Enhanced validation
    const requiredFields = ["client_id", "payment_type", "amount", "payment_method"];
    const missingFields = requiredFields.filter(field => !body[field as keyof PaymentCreateData]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (!VALID_PAYMENT_TYPES.includes(body.payment_type)) {
      return NextResponse.json(
        { error: `Invalid payment type. Must be one of: ${VALID_PAYMENT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!VALID_PAYMENT_METHODS.includes(body.payment_method)) {
      return NextResponse.json(
        { error: `Invalid payment method. Must be one of: ${VALID_PAYMENT_METHODS.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify client exists and belongs to user
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, first_name, last_name, email")
      .eq("id", body.client_id)
      .eq("user_id", user.id)
      .single();

    if (clientError || !client) {
      console.error("Client verification error:", clientError);
      return NextResponse.json(
        { error: "Client not found or access denied" },
        { status: 404 }
      );
    }

    // Verify policy (if provided)
    if (body.policy_id) {
      const { data: policy, error: policyError } = await supabase
        .from("policies")
        .select("id, client_id, policy_number, policy_name")
        .eq("id", body.policy_id)
        .eq("user_id", user.id)
        .single();

      if (policyError || !policy) {
        console.error("Policy verification error:", policyError);
        return NextResponse.json(
          { error: "Policy not found or access denied" },
          { status: 404 }
        );
      }

      // Verify policy belongs to the specified client
      if (policy.client_id !== body.client_id) {
        return NextResponse.json(
          { error: "Policy does not belong to the specified client" },
          { status: 400 }
        );
      }
    }

    // Verify claim (if provided)
    if (body.claim_id) {
      const { data: claim, error: claimError } = await supabase
        .from("claims")
        .select("id, client_id, claim_number, claim_type")
        .eq("id", body.claim_id)
        .eq("user_id", user.id)
        .single();

      if (claimError || !claim) {
        console.error("Claim verification error:", claimError);
        return NextResponse.json(
          { error: "Claim not found or access denied" },
          { status: 404 }
        );
      }

      // Verify claim belongs to the specified client
      if (claim.client_id !== body.client_id) {
        return NextResponse.json(
          { error: "Claim does not belong to the specified client" },
          { status: 400 }
        );
      }
    }

    // Generate unique payment reference
    const generatePaymentReference = async (): Promise<string> => {
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const paymentRef = `PAY-${timestamp}-${random}`;
        
        // Check if reference exists
        const { data: existingPayment } = await supabase
          .from("payments")
          .select("payment_reference")
          .eq("payment_reference", paymentRef)
          .single();
          
        if (!existingPayment) {
          return paymentRef;
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      throw new Error("Unable to generate unique payment reference");
    };

    const paymentRef = await generatePaymentReference();

    // Prepare payment data
    const paymentData = {
      user_id: user.id,
      client_id: body.client_id,
      policy_id: body.policy_id || null,
      claim_id: body.claim_id || null,
      payment_reference: paymentRef,
      payment_type: body.payment_type,
      amount: parseFloat(body.amount.toString()),
      currency: body.currency || "BWP",
      payment_method: body.payment_method,
      payment_details: body.payment_details || {},
      status: "pending", // Default status
      due_date: body.due_date || null,
      payment_date: body.payment_date || null,
      transaction_id: body.transaction_id?.trim() || null,
      external_reference: body.external_reference?.trim() || null,
      description: body.description?.trim() || null,
      notes: body.notes?.trim() || null,
      tags: body.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Creating payment with data:", { ...paymentData, user_id: user.id });

    // Create payment
    const { data: payment, error: insertError } = await supabase
      .from("payments")
      .insert([paymentData])
      .select(
        `
        *,
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
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      
      // Handle specific constraint violations
      if (insertError.code === '23505') {
        if (insertError.message.includes('payment_reference')) {
          return NextResponse.json(
            { error: "Payment reference already exists. Please try again." },
            { status: 409 }
          );
        }
      }

      if (insertError.code === '23503') {
        return NextResponse.json(
          { error: "Invalid relationship reference (client, policy, or claim)" },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to create payment",
          details: process.env.NODE_ENV === "development" ? insertError.message : undefined
        },
        { status: 500 }
      );
    }

    // Transform response data
    const paymentWithFullName = {
      ...payment,
      client: payment.client ? {
        ...payment.client,
        full_name: `${payment.client.first_name || ''} ${payment.client.last_name || ''}`.trim() || 'Unknown Client',
      } : null,
    };

    console.log("Payment created successfully:", paymentWithFullName.payment_reference);

    return NextResponse.json({
      data: paymentWithFullName,
      message: "Payment created successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" 
          ? (error instanceof Error ? error.message : "Unknown error")
          : undefined
      },
      { status: 500 }
    );
  }
}