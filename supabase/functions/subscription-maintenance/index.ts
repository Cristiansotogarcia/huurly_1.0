import { serve } from "http/server";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔄 Running subscription maintenance tasks...");

    // Check for expiring subscriptions and send notifications
    console.log("📅 Checking for expiring subscriptions...");
    const { error: expiringError } = await supabase.rpc('check_expiring_subscriptions');
    
    if (expiringError) {
      console.error("❌ Error checking expiring subscriptions:", expiringError);
      throw expiringError;
    } else {
      console.log("✅ Successfully checked expiring subscriptions");
    }

    // Expire overdue subscriptions
    console.log("⏰ Expiring overdue subscriptions...");
    const { error: expireError } = await supabase.rpc('expire_subscriptions');
    
    if (expireError) {
      console.error("❌ Error expiring subscriptions:", expireError);
      throw expireError;
    } else {
      console.log("✅ Successfully expired overdue subscriptions");
    }

    // Get statistics
    const { data: stats, error: statsError } = await supabase
      .from('abonnementen')
      .select('status')
      .in('status', ['actief', 'verlopen', 'wachtend']);

    if (statsError) {
      console.error("❌ Error getting subscription stats:", statsError);
    } else {
      const statusCount = stats.reduce((acc, sub) => {
        acc[sub.status] = (acc[sub.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log("📊 Subscription stats:", statusCount);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription maintenance completed successfully",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Subscription maintenance error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});