import { createServerClient } from '@/lib/supabase/server';
import PlansClient from '@/components/plans-client';

export default async function PlansPage() {
  const supabase = await createServerClient();
  
  const { data: plans, error } = await supabase
    .from('plans')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
  }

  return <PlansClient initialPlans={plans || []} />;
}
