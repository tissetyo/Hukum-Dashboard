import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
    try {
        // Create an unmodified response
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        });

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        );
                        response = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        // This will refresh session if expired - required for Server Components
        // https://supabase.com/docs/guides/auth/server-side/nextjs
        const { data: { user } } = await supabase.auth.getUser();

        // Protection logic
        // 1. If user is trying to access admin routes and is NOT logged in -> redirect to login
        if (request.nextUrl.pathname.startsWith("/admin") && !user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // 2. If user is on login page and IS logged in -> redirect to admin
        if (request.nextUrl.pathname === "/login" && user) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }

        return response;
    } catch (e) {
        // If you are here, a Supabase client could not be created!
        // This is likely because you have not set up environment variables.
        // Check out http://localhost:3000 for Next Steps.
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }
};
