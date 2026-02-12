import ParticleEffectDemo from "@/components/ui/particle-demo";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  if (!supabase) {
    return <ParticleEffectDemo user={null} />;
  }

  const { data: { user } } = await supabase.auth.getUser();

  return <ParticleEffectDemo user={user} />;
}
