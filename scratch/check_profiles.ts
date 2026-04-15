import { createAdminClient } from '../src/lib/supabase/admin';

async function main() {
  const admin = createAdminClient();
  if (!admin) {
    console.log('No admin client');
    return;
  }
  const { data, error } = await admin.from('profiles').select('*').limit(5);
  console.log(JSON.stringify(data, null, 2));
}
main();
