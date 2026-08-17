import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized: Missing auth token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check user role in public.profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: Admin privileges required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, pointData, pointId, materialIds } = await req.json();

    if (action === "create") {
      const { data: newPoint, error: createError } = await supabase
        .from("collection_points")
        .insert({
          name: pointData.name,
          address: pointData.address,
          latitude: pointData.latitude,
          longitude: pointData.longitude,
          contact_phone: pointData.contact_phone,
          opening_hours: pointData.opening_hours,
        })
        .select()
        .single();

      if (createError) throw createError;

      if (materialIds && Array.isArray(materialIds) && materialIds.length > 0) {
        const pointMaterials = materialIds.map((mId: string) => ({
          point_id: newPoint.id,
          material_id: mId,
        }));
        await supabase.from("point_materials").insert(pointMaterials);
      }

      return new Response(JSON.stringify({ success: true, point: newPoint }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (action === "update") {
      const { data: updatedPoint, error: updateError } = await supabase
        .from("collection_points")
        .update(pointData)
        .eq("id", pointId)
        .select()
        .single();

      if (updateError) throw updateError;

      if (materialIds && Array.isArray(materialIds)) {
        await supabase.from("point_materials").delete().eq("point_id", pointId);
        if (materialIds.length > 0) {
          const pointMaterials = materialIds.map((mId: string) => ({
            point_id: pointId,
            material_id: mId,
          }));
          await supabase.from("point_materials").insert(pointMaterials);
        }
      }

      return new Response(JSON.stringify({ success: true, point: updatedPoint }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (action === "delete") {
      const { error: deleteError } = await supabase
        .from("collection_points")
        .delete()
        .eq("id", pointId);

      if (deleteError) throw deleteError;

      return new Response(JSON.stringify({ success: true, deletedId: pointId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Invalid action. Allowed: create, update, delete" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to manage point" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
