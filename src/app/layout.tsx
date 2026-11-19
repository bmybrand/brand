import type { ReactNode } from "react";
import "./migration.css";

const hydrationAttributeGuard = `
(() => {
  const attributes = ["bis_skin_checked", "bis_register"];
  const clean = (root) => {
    if (!(root instanceof Element)) return;
    attributes.forEach((attribute) => root.removeAttribute(attribute));
    root.querySelectorAll("[bis_skin_checked], [bis_register]").forEach((element) => {
      attributes.forEach((attribute) => element.removeAttribute(attribute));
    });
  };

  clean(document.documentElement);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes") clean(mutation.target);
      mutation.addedNodes.forEach(clean);
    });
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: attributes,
    childList: true,
    subtree: true,
  });
  window.addEventListener("load", () => window.setTimeout(() => observer.disconnect(), 3000), { once: true });
})();
`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: hydrationAttributeGuard }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
