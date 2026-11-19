import type { CapturedPage } from "@/generated/pages";
import { ClientEnhancements } from "./client-enhancements";
import { PageContent } from "./page-content";
import { SharedFooter } from "./shared-footer";
import { SharedHeader } from "./shared-header";
import { SiteAnimations } from "./site-animations";
import { SmoothScroll } from "./smooth-scroll";

export function SiteShell({ page }: { page: CapturedPage }) {
  return (
    <div data-site-root className="min-h-screen w-full overflow-x-hidden" suppressHydrationWarning>
      {page.stylesheets.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {!page.headerInMain && <SharedHeader />}
      <PageContent page={page} />
      <SharedFooter />
      <ClientEnhancements />
      <SmoothScroll />
      <SiteAnimations />
    </div>
  );
}
