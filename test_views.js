require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from("page_views").select("id").limit(1);
  if (error) {
    console.error("DB Error:", error.message);
  } else {
    console.log("Success! Found:", data);
  }
}
check();
