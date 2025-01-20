import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/apis(.*)"]);

// export default clerkMiddleware();
export default clerkMiddleware(async (auth, req) => {
  // If this request matches /apis/... then require the user to be signed in
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    // "/(api|trpc)(.*)",
    // Match /apis/* in your middleware.ts config.
    "/(api|apis|trpc)(.*)",
  ],
};
