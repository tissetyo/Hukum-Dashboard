import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ users: [], error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 200 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        const { data, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) {
            return NextResponse.json({ users: [], error: error.message }, { status: 200 });
        }

        const users = (data.users || []).map(u => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
        }));

        return NextResponse.json({ users });
    } catch (e: any) {
        return NextResponse.json({ users: [], error: e.message }, { status: 500 });
    }
}
