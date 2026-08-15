import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const destroyImage = async (
  publicId: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string
): Promise<boolean> => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(paramsToSign);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Failed to destroy image ${publicId} on Cloudinary:`, text);
      return false;
    }

    const json = await res.json();
    console.log(`Cloudinary destroy result for ${publicId}:`, json);
    return json.result === "ok" || json.result === "not found";
  } catch (err) {
    console.error(`Error deleting image ${publicId} from Cloudinary:`, err);
    return false;
  }
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Authenticate system calls using SUPABASE_SERVICE_ROLE_KEY
    const authHeader = req.headers.get("Authorization");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!authHeader || authHeader.replace("Bearer ", "") !== serviceKey) {
      return new Response(JSON.stringify({ error: "Unauthorized system call" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");
    const apiKey = Deno.env.get("CLOUDINARY_API_KEY");
    const cloudName = Deno.env.get("EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME");

    if (!apiSecret || !apiKey || !cloudName) {
      return new Response(JSON.stringify({ error: "Cloudinary credentials missing in environment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 2. Define clean up thresholds
    // - training_consent = false AND older than 7 days
    // - OR older than 30 days for any record
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Query 1: Records without training consent older than 7 days
    const { data: noConsentRecords, error: err1 } = await supabase
      .from("recognition_records")
      .select("id, cloudinary_public_id")
      .not("cloudinary_public_id", "is", null)
      .eq("training_consent", false)
      .lt("created_at", sevenDaysAgo);

    // Query 2: Any records older than 30 days
    const { data: oldRecords, error: err2 } = await supabase
      .from("recognition_records")
      .select("id, cloudinary_public_id")
      .not("cloudinary_public_id", "is", null)
      .lt("created_at", thirtyDaysAgo);

    if (err1) console.error("Error fetching no-consent records:", err1);
    if (err2) console.error("Error fetching old records:", err2);

    // Combine and deduplicate
    const combined = [...(noConsentRecords || []), ...(oldRecords || [])];
    const recordMap = new Map();
    for (const r of combined) {
      recordMap.set(r.id, r);
    }
    const recordsToClean = Array.from(recordMap.values());

    console.log(`Found ${recordsToClean.length} records to clean up from Cloudinary storage.`);

    let successCount = 0;
    let failureCount = 0;

    // 3. Process deletions sequentially to avoid rate limiting
    for (const record of recordsToClean) {
      const publicId = record.cloudinary_public_id;
      if (!publicId) continue;

      const deleted = await destroyImage(publicId, cloudName, apiKey, apiSecret);
      if (deleted) {
        // Update database record to mark as storage-deleted
        const { error: updateError } = await supabase
          .from("recognition_records")
          .update({
            cloudinary_public_id: null,
            image_url: "", // Clear URL to reflect file deletion
          })
          .eq("id", record.id);

        if (updateError) {
          console.error(`DB Update failed for record ${record.id}:`, updateError);
          failureCount++;
        } else {
          successCount++;
        }
      } else {
        failureCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: recordsToClean.length,
        deleted: successCount,
        failed: failureCount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to execute cleanup" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
