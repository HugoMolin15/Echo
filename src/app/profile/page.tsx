import { createClient } from "@/utils/supabase/server";
import ProfilePage from "./profile-client";

export default async function Page() {
    const supabase = await createClient();

    if (!supabase) {
        return <ProfilePage user={null} />;
    }

    const { data: { user } } = await supabase.auth.getUser();

    return <ProfilePage user={user} />;
}
