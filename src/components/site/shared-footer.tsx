import { sharedFooterHtml } from "@/generated/pages";

export function SharedFooter() {
  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: sharedFooterHtml }} />;
}
