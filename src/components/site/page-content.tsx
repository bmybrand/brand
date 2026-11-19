import { sharedHeaderHtml, type CapturedPage } from "@/generated/pages";

export function PageContent({ page }: { page: CapturedPage }) {
  const capturedHtml = page.headerInMain
    ? page.mainHtml.replace("<!--SHARED_HEADER-->", sharedHeaderHtml)
    : page.mainHtml;
  // Captured pages still contain their original footer. The shell renders the
  // shared animated footer once, so remove the embedded copy from page content.
  const html = capturedHtml
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<meta\b[^>]*>/gi, "");
  return (
    <main
      className={page.mainClassName || undefined}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
