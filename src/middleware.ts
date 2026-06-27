export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/dashboard/:path*",
    "/api/posts/:path*",
    "/api/citations/:path*",
    "/api/settings/:path*",
    "/api/reviews/:path*",
    "/api/rankings/:path*",
    "/api/reports/:path*",
    "/api/billing/:path*",
  ],
};
