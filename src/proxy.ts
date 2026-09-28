import { NextResponse, type NextRequest } from "next/server";

// Pre-launch gate: every page shows /coming-soon until COMING_SOON=0 is set in the environment.
// The team can still see the real site: open any URL with ?access=glint once (sets a cookie).
// ponytail: the access key lives in a public repo, so it only hides the site, it does not protect it.
const ACCESS_KEY = "glint";
const COOKIE = "glint_access";

export function proxy(request: NextRequest) {
  if (process.env.COMING_SOON === "0") return NextResponse.next();

  const { searchParams } = request.nextUrl;
  if (searchParams.get("access") === ACCESS_KEY) {
    const clean = request.nextUrl.clone();
    clean.searchParams.delete("access");
    const res = NextResponse.redirect(clean);
    res.cookies.set(COOKIE, "1", { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
    return res;
  }
  if (request.cookies.get(COOKIE)?.value === "1") return NextResponse.next();

  return NextResponse.rewrite(new URL("/coming-soon", request.url));
}

export const config = {
  // Everything except the teaser itself, Next internals, the shadcn registry, API routes and static files.
  matcher: ["/((?!coming-soon|_next|r/|api/|icon\\.svg|mascots/|thumbs/|fonts/|robots\\.txt|sitemap\\.xml).*)"],
};
