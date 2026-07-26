import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClassifyRequest {
  imageUrl: string;
  trainingConsent?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY secret missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify User JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ClassifyRequest = await req.json();
    const { imageUrl, trainingConsent = false } = body;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Google Gemini API (gemini-2.5-flash or gemini-flash-latest)
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    const prompt = `Analyze this image of waste/item for a recycling application.
    Return ONLY a valid JSON object matching this schema precisely:
    {
      "material_code": "plastic_pet" | "glass" | "paper" | "cardboard" | "aluminum" | "metal" | "organic" | "electronic" | "hazardous" | "non_recyclable",
      "material_name": "Human readable name in Spanish",
      "confidence": number between 0.0 and 1.0,
      "recyclable": boolean,
      "eco_points": number between 5 and 50,
      "disposal_instructions": "Clear step-by-step instructions in Spanish on how to prepare and recycle or dispose of this item"
    }
    No extra text or markdown codeblocks outside JSON.`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              file_data: {
                file_uri: imageUrl,
              },
            },
          ],
        },
      ],
    };

    // If file_uri is a standard web URL, we can pass image inline or via image fetching
    // Fallback: Fetch image bytes if file_data isn't direct URL
    const imageRes = await fetch(imageUrl);
    const imageArrayBuffer = await imageRes.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(imageArrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    const mimeType = imageRes.headers.get("content-type") || "image/jpeg";

    const inlinePayload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
    };

    const geminiRes = await fetch(geminiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": geminiApiKey,
      },
      body: JSON.stringify(inlinePayload),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error("Gemini API error:", errorText);
      return new Response(JSON.stringify({ error: "Gemini API classification failed", details: errorText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiData = await geminiRes.json();
    const rawContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Clean potential markdown fencing from LLM response
    const cleanJsonString = rawContent.replace(/```json\n?|\n?```/g, "").trim();
    let classification = {
      material_code: "unknown",
      material_name: "Residuo No Identificado",
      confidence: 0.5,
      recyclable: false,
      eco_points: 5,
      disposal_instructions: "Por favor deseche este material en un contenedor de basura general.",
    };

    try {
      classification = JSON.parse(cleanJsonString);
    } catch (e) {
      console.error("Error parsing Gemini JSON output:", e, rawContent);
    }

    // Insert record in Database
    const { data: record, error: dbError } = await supabase
      .from("recognition_records")
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        material_code: classification.material_code,
        material_name: classification.material_name,
        confidence: classification.confidence,
        recyclable: classification.recyclable,
        eco_points_earned: classification.eco_points,
        disposal_instructions: classification.disposal_instructions,
        raw_gemini_response: geminiData,
        training_consent: trainingConsent,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
    }

    // Update user eco_points
    if (classification.eco_points > 0) {
      await supabase.rpc("increment_eco_points", {
        user_id_param: user.id,
        points_to_add: classification.eco_points,
      }).catch(async () => {
        // Fallback standard update
        const { data: profile } = await supabase
          .from("profiles")
          .select("eco_points")
          .eq("id", user.id)
          .single();

        const currentPoints = profile?.eco_points || 0;
        await supabase
          .from("profiles")
          .update({ eco_points: currentPoints + classification.eco_points })
          .eq("id", user.id);
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        record: record || null,
        classification,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
