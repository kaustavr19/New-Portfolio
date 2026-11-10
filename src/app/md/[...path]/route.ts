import { htmlPathFor, markdownFor, markdownPaths, markdownResponse } from "@/lib/markdown";

/* Markdown twin of every readable page. Not linked directly — reached via
   the rewrites in next.config.ts:
     /work/agent-compose.md                       → /md/work/agent-compose
     /work/agent-compose + Accept: text/markdown  → /md/work/agent-compose */

export const dynamicParams = false;

export function generateStaticParams() {
  return markdownPaths.map((path) => ({ path }));
}

export async function GET(_: Request, ctx: RouteContext<"/md/[...path]">) {
  const { path } = await ctx.params;
  const md = markdownFor(path);
  if (md == null) return new Response("Not found\n", { status: 404 });
  return markdownResponse(md, htmlPathFor(path));
}
