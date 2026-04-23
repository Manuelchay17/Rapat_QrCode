import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Semua link yang dimulai dengan /dashboard akan terkunci
export const config = { 
  matcher: ["/dashboard/:path*"] 
};