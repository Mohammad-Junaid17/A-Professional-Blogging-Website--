require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.rpc("exec_sql", { query: "SELECT 1;" });
  if (error) {
    console.error("RPC Error:", error.message);
  } else {
    console.log("Success! Found:", data);
  }
}
check();
