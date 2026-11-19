import { sharedHeaderHtml } from "@/generated/pages";

export function SharedHeader() {
  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: sharedHeaderHtml }} />;
}
