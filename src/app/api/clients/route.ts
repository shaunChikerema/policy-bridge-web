// app/api/clients/route.ts
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
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("is_active");
    const sortField = searchParams.get("sort_field") || "created_at";
    const sortDirection = searchParams.get("sort_direction") || "desc";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("clients")
      .select("*", { count: "exact" })
      .range(from, to)
      .order(sortField, { ascending: sortDirection === "asc" });

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    if (isActive && isActive !== "all") {
      query = query.eq("is_active", isActive === "true");
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch clients" },
        { status: 500 }
      );
    }

    const enhancedClients = (data || []).map((client) => ({
      ...client,
      full_name: `${client.first_name} ${client.last_name}`.trim(),
      join_date: client.created_at,
    }));

    return NextResponse.json({
      data: enhancedClients,
      count: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Creating client with data:", body);

    // Validate required fields
    if (!body.first_name || !body.last_name || !body.email) {
      return NextResponse.json(
        { error: "Missing required fields: first_name, last_name, email" },
        { status: 400 }
      );
    }

    // Get a real user ID from your auth.users table
    const { data: users, error: usersError } = await supabase
      .from("users") // Try 'users' table first
      .select("id")
      .limit(1);

    let userId: string;

    if (users && users.length > 0) {
      // Use the first user from the users table
      userId = users[0].id;
    } else {
      // Try to get a user from auth.users
      const { data: authUsers, error: authError } =
        await supabase.auth.admin.listUsers();
      if (authUsers && authUsers.users.length > 0) {
        userId = authUsers.users[0].id;
      } else {
        // Create a test user if none exist
        const { data: newUser, error: createError } =
          await supabase.auth.admin.createUser({
            email: "test@policybridge.com",
            password: "testpassword123",
            email_confirm: true,
          });

        if (newUser) {
          userId = newUser.user.id;
        } else {
          // Last resort: disable the foreign key constraint temporarily
          console.warn("No users found, creating client without user_id");
          userId = "00000000-0000-0000-0000-000000000000";
        }
      }
    }

    console.log("Using user_id:", userId);

    // Check if client with email already exists
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("email", body.email.toLowerCase())
      .single();

    if (existingClient) {
      return NextResponse.json(
        { error: "A client with this email address already exists" },
        { status: 409 }
      );
    }

    // Prepare client data
    const clientData = {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email.toLowerCase(),
      phone: body.phone || null,
      date_of_birth: body.date_of_birth || null,
      gender: body.gender || null,
      address_line1: body.address_line1 || null,
      address_line2: body.address_line2 || null,
      city: body.city || null,
      state: body.state || null,
      postal_code: body.postal_code || null,
      country: body.country || "BW",
      occupation: body.occupation || null,
      employer: body.employer || null,
      annual_income: body.annual_income ? parseFloat(body.annual_income) : null,
      emergency_contact_name: body.emergency_contact_name || null,
      emergency_contact_phone: body.emergency_contact_phone || null,
      emergency_contact_relationship:
        body.emergency_contact_relationship || null,
      notes: body.notes || null,
      tags: body.tags || [],
      is_active: body.is_active !== undefined ? body.is_active : true,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Inserting client data:", clientData);

    const { data: newClient, error } = await supabase
      .from("clients")
      .insert([clientData])
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);

      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A client with this email address already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create client: " + error.message },
        { status: 500 }
      );
    }

    const enhancedClient = {
      ...newClient,
      full_name: `${newClient.first_name} ${newClient.last_name}`.trim(),
      join_date: newClient.created_at,
    };

    console.log("Successfully created client:", enhancedClient);

    return NextResponse.json({ data: enhancedClient }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
