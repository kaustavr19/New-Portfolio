import { llmsFullTxt } from "@/lib/markdown";

// Built once at deploy time — content only changes with a new build.
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsFullTxt().trim() + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
