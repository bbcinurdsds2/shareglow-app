// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vwomhjsznxdirjfnlhca.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3b21oanN6bnhkaXJqZm5saGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NTM0NTUsImV4cCI6MjA1ODMyOTQ1NX0.1cF3s723rYGJHJ5BOp28l8L-RTJq7-ZFH6EG_6HVRIk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);