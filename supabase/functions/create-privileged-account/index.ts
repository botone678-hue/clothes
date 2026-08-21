import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceRoleKey || !anonKey) return json({ error: "Supabase server configuration is incomplete." }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Authorization required." }, 401);

    const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !caller) return json({ error: "Invalid authentication session." }, 401);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: callerProfile, error: profileError } = await adminClient
      .from("profiles").select("id, role, status").eq("auth_user_id", caller.id).single();
    if (profileError || callerProfile?.role !== "admin" || callerProfile.status !== "active") {
      return json({ error: "Administrator access required." }, 403);
    }

    const body = await req.json();
    const role = body.role === "driver" || body.role === "admin" ? body.role : null;
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const fullName = String(body.full_name || "").trim();
    const phone = String(body.phone || "").trim();
    if (!role || !email || !password || !fullName) return json({ error: "role, email, password and full_name are required." }, 400);
    if (password.length < 8) return json({ error: "Password must be at least 8 characters." }, 400);

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone, role, privileged_creator: true },
    });
    if (createError || !created.user) return json({ error: createError?.message || "Unable to create authentication account." }, 400);

    // The auth trigger creates the profile. Update it rather than inserting a duplicate.
    const { data: profile, error: profileError2 } = await adminClient
      .from("profiles")
      .update({ full_name: fullName, email, phone: phone || null, role, status: "active" })
      .eq("auth_user_id", created.user.id)
      .select().single();
    if (profileError2 || !profile) {
      await adminClient.auth.admin.deleteUser(created.user.id);
      return json({ error: profileError2?.message || "Unable to finalize profile." }, 500);
    }

    if (role === "driver") {
      const { error: driverError } = await adminClient.from("drivers").upsert({
        profile_id: profile.id,
        vehicle_type: String(body.vehicle_type || "Motorcycle"),
        vehicle_registration: body.vehicle_registration ? String(body.vehicle_registration) : null,
        zone: body.zone ? String(body.zone) : "Hawaii Area & Eldoret",
        availability_status: "available",
      }, { onConflict: "profile_id" });
      if (driverError) {
        await adminClient.auth.admin.deleteUser(created.user.id);
        return json({ error: driverError.message }, 500);
      }
    }

    return json({ success: true, account: { id: profile.id, auth_user_id: created.user.id, email, role, full_name: fullName } }, 201);
  } catch (error) {
    console.error(error);
    return json({ error: "Unexpected server error." }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
