// src/app/api/policies/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const policy_type = searchParams.get("policy_type");
    const priority = searchParams.get("priority");
    const user_id = searchParams.get("user_id");

    let query = supabase
      .from("policies")
      .select(
        `*,
        client:clients!policies_client_id_fkey (
          id, first_name, last_name, email, phone
        )`,
        { count: "exact" }
      );

    if (user_id) query = query.eq("user_id", user_id);
    if (search) query = query.or(`policy_name.ilike.%${search}%,policy_number.ilike.%${search}%,description.ilike.%${search}%`);
    if (status) query = query.eq("status", status);
    if (policy_type) query = query.eq("policy_type", policy_type);
    if (priority) query = query.eq("priority", priority);

    query = query.order("created_at", { ascending: false });

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data: policies, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 });
    }

    const policiesWithFullName = policies?.map((policy) => ({
      ...policy,
      client: policy.client
        ? { ...policy.client, full_name: `${policy.client.first_name} ${policy.client.last_name}`.trim() }
        : null,
    }));

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: policiesWithFullName || [],
      pagination: { page, limit, total: count || 0, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get user_id from JWT token in Authorization header (set automatically by Supabase client)
    let userId = body.user_id;
    if (!userId) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id;
      }
    }
    if (!userId) {
      // Fallback: get from auth.users - use first available user (dev mode)
      const { data: authData } = await supabase.auth.admin.listUsers();
      userId = authData?.users?.[0]?.id;
    }
    if (!userId) {
      return NextResponse.json({ error: "Could not determine user" }, { status: 401 });
    }

    const requiredFields = ["client_id", "policy_name", "policy_type", "coverage_amount", "premium_amount", "effective_date", "expiration_date"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Validate dates
    const effectiveDate = new Date(body.effective_date);
    const expirationDate = new Date(body.expiration_date);
    if (effectiveDate >= expirationDate) {
      return NextResponse.json({ error: "Effective date must be before expiration date" }, { status: 400 });
    }

    const coverageAmount = parseFloat(body.coverage_amount);
    if (isNaN(coverageAmount) || coverageAmount <= 0) {
      return NextResponse.json({ error: "Coverage amount must be a valid positive number" }, { status: 400 });
    }

    const premiumAmount = parseFloat(body.premium_amount);
    if (isNaN(premiumAmount) || premiumAmount <= 0) {
      return NextResponse.json({ error: "Premium amount must be a valid positive number" }, { status: 400 });
    }

    const deductible = parseFloat(body.deductible || 0);
    if (isNaN(deductible) || deductible < 0) {
      return NextResponse.json({ error: "Deductible must be a valid non-negative number" }, { status: 400 });
    }

    const generatePolicyNumber = () => {
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `POL-${timestamp}-${random}`;
    };

    const insertData = {
      user_id: userId,
      client_id: body.client_id,
      policy_number: generatePolicyNumber(),
      policy_name: body.policy_name.trim(),
      policy_type: body.policy_type,
      description: body.description?.trim() || null,
      coverage_amount: coverageAmount,
      premium_amount: premiumAmount,
      deductible: deductible,
      effective_date: body.effective_date,
      expiration_date: body.expiration_date,
      renewal_date: body.renewal_date || null,
      status: body.status || "pending",
      priority: body.priority || "medium",
      terms_conditions: body.terms_conditions?.trim() || null,
      beneficiaries: body.beneficiaries || null,
      riders: body.riders || null,
      notes: body.notes?.trim() || null,
      tags: body.tags || [],
    };

    const { data: policy, error } = await supabase
      .from("policies")
      .insert([insertData])
      .select(`*, client:clients!policies_client_id_fkey (id, first_name, last_name, email, phone)`)
      .single();

    if (error) {
      console.error("Database error:", error);
      if (error.code === "23505") {
        insertData.policy_number = generatePolicyNumber();
        const { data: retryPolicy, error: retryError } = await supabase
          .from("policies")
          .insert([insertData])
          .select(`*, client:clients!policies_client_id_fkey (id, first_name, last_name, email, phone)`)
          .single();

        if (retryError) {
          return NextResponse.json({ error: "Failed to create policy after retry", details: retryError.message }, { status: 500 });
        }

        return NextResponse.json({
          data: {
            ...retryPolicy,
            client: retryPolicy.client
              ? { ...retryPolicy.client, full_name: `${retryPolicy.client.first_name} ${retryPolicy.client.last_name}`.trim() }
              : null,
          },
          message: "Policy created successfully",
        }, { status: 201 });
      }

      return NextResponse.json({ error: "Failed to create policy", details: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        ...policy,
        client: policy.client
          ? { ...policy.client, full_name: `${policy.client.first_name} ${policy.client.last_name}`.trim() }
          : null,
      },
      message: "Policy created successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}