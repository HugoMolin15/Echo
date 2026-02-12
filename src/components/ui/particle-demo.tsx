import Component from "@/components/ui/particle-effect-for-hero";
import { User } from "@supabase/supabase-js";

export default function ParticleEffectDemo({ user }: { user: User | null }) {
    return <Component user={user} />;
}
