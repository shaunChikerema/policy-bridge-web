// src/app/api/claims/route.ts (FIXED)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortField = searchParams.get("sort_field") || "created_at";
    const sortDirection = searchParams.get("sort_direction") || "desc";
    const status = searchParams.get("status");
    const claimType = searchParams.get("claim_type");
    const clientId = searchParams.get("client_id");
    const policyId = searchParams.get("policy_id");
    const search = searchParams.get("search");

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const startIndex = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from("claims")
      .select(
        `
        *,
        client:clients!claims_client_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        policy:policies!claims_policy_id_fkey (
          id,
          policy_number,
          policy_name,
          policy_type,
          coverage_amount
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", user.id);

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (claimType) {
      query = query.eq("claim_type", claimType);
    }

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    if (policyId) {
      query = query.eq("policy_id", policyId);
    }

    // Apply search filter
    if (search) {
      query = query.or(`
        claim_number.ilike.%${search}%,
        description.ilike.%${search}%,
        incident_location.ilike.%${search}%,
        clients.first_name.ilike.%${search}%,
        clients.last_name.ilike.%${search}%,
        policies.policy_number.ilike.%${search}%
      `);
    }

    // Apply sorting
    const validSortFields = [
      "claim_number",
      "claim_type",
      "status",
      "priority",
      "incident_date",
      "reported_date",
      "created_at",
      "updated_at",
      "claim_amount",
    ];

    const validSortDirections = ["asc", "desc"];

    const finalSortField = validSortFields.includes(sortField)
      ? sortField
      : "created_at";
    const finalSortDirection = validSortDirections.includes(sortDirection)
      ? sortDirection
      : "desc";

    query = query.order(finalSortField, {
      ascending: finalSortDirection === "asc",
    });

    // Apply pagination
    query = query.range(startIndex, startIndex + limit - 1);

    // Execute the query
    const { data: claims, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch claims" },
        { status: 500 }
      );
    }

    // Add full_name to client objects
    const claimsWithFullNames = claims.map((claim) => ({
      ...claim,
      client: claim.client
        ? {
            ...claim.client,
            full_name:
              `${claim.client.first_name} ${claim.client.last_name}`.trim(),
          }
        : null,
    }));

    return NextResponse.json({
      data: claimsWithFullNames,
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
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "client_id",
      "policy_id",
      "claim_type",
      "incident_date",
      "description",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field.replace("_", " ")} is required` },
          { status: 400 }
        );
      }
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
        { error: "Invalid client ID or client not found" },
        { status: 400 }
      );
    }

    // Verify policy belongs to user and client
    const { data: policy, error: policyError } = await supabase
      .from("policies")
      .select("id")
      .eq("id", body.policy_id)
      .eq("user_id", user.id)
      .eq("client_id", body.client_id)
      .single();

    if (policyError || !policy) {
      return NextResponse.json(
        { error: "Invalid policy ID or policy not found for this client" },
        { status: 400 }
      );
    }

    // Validate dates
    const incidentDate = new Date(body.incident_date);
    const reportedDate = body.reported_date
      ? new Date(body.reported_date)
      : new Date();
    const today = new Date();

    if (incidentDate > today) {
      return NextResponse.json(
        { error: "Incident date cannot be in the future" },
        { status: 400 }
      );
    }

    if (reportedDate < incidentDate) {
      return NextResponse.json(
        { error: "Reported date cannot be before incident date" },
        { status: 400 }
      );
    }

    // Validate numeric fields
    let claimAmount: number | null = null;
    if (body.claim_amount !== undefined && body.claim_amount !== null) {
      claimAmount = parseFloat(body.claim_amount.toString());
      if (isNaN(claimAmount) || claimAmount < 0) {
        return NextResponse.json(
          { error: "Claim amount must be a valid non-negative number" },
          { status: 400 }
        );
      }
    }

    // **FIXED: Remove claim_number from insert data - let the database trigger handle it**
    // Prepare insert data WITHOUT claim_number
    const insertData = {
      user_id: user.id,
      client_id: body.client_id,
      policy_id: body.policy_id,
      // claim_number: REMOVED - will be set by database trigger
      claim_type: body.claim_type,
      incident_date: body.incident_date,
      reported_date:
        body.reported_date || new Date().toISOString().split("T")[0],
      description: body.description.trim(),
      incident_location: body.incident_location?.trim() || null,
      claim_amount: claimAmount,
      status: body.status || "pending",
      priority: body.priority || "medium",
      assigned_adjuster: body.assigned_adjuster?.trim() || null,
      assigned_investigator: body.assigned_investigator?.trim() || null,
      investigation_start_date: body.investigation_start_date || null,
      investigation_end_date: body.investigation_end_date || null,
      documents: body.documents || null,
      evidence: body.evidence || null,
      witness_information: body.witness_information || null,
      notes: body.notes?.trim() || null,
      internal_notes: body.internal_notes?.trim() || null,
      tags: body.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Inserting claim (claim_number will be generated by database trigger):", {
      client_id: insertData.client_id,
      policy_id: insertData.policy_id,
      claim_type: insertData.claim_type
    });

    const { data: claim, error: insertError } = await supabase
      .from("claims")
      .insert([insertData])
      .select(
        `
        *,
        client:clients!claims_client_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        policy:policies!claims_policy_id_fkey (
          id,
          policy_number,
          policy_name,
          policy_type,
          coverage_amount
        )
      `
      )
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);

      // Handle specific database errors
      if (insertError.code === "23505") {
        if (insertError.message.includes("claims_claim_number_key")) {
          // This should be extremely rare with the database trigger's duplicate handling
          return NextResponse.json(
            {
              error: "Claim number conflict detected. Please try submitting again.",
            },
            { status: 409 }
          );
        } else if (insertError.message.includes("unique constraint")) {
          return NextResponse.json(
            { error: "Database constraint violation. Please check your data." },
            { status: 409 }
          );
        }
      }

      return NextResponse.json(
        {
          error: "Failed to create claim",
          details:
            process.env.NODE_ENV === "development" ? insertError.message : undefined,
        },
        { status: 500 }
      );
    }

    const claimWithFullName = {
      ...claim,
      client: claim.client
        ? {
            ...claim.client,
            full_name:
              `${claim.client.first_name} ${claim.client.last_name}`.trim(),
          }
        : null,
    };

    console.log("Claim created successfully with number:", claim.claim_number);

    return NextResponse.json(
      {
        data: claimWithFullName,
        message: "Claim created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}