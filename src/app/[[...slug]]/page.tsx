import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/site-shell";
import { capturedPages, type CapturedRoute } from "@/generated/pages";

type PageProps = { params: Promise<{ slug?: string[] }> };

function routeFrom(slug?: string[]): string {
  return slug?.length ? `/${slug.join("/")}` : "/";
}

function isCapturedRoute(route: string): route is CapturedRoute {
  return Object.prototype.hasOwnProperty.call(capturedPages, route);
}

export function generateStaticParams() {
  return Object.keys(capturedPages).map((route) => ({
    slug: route === "/" ? [] : route.slice(1).split("/"),
  }));
}

export default async function CapturedRoutePage({ params }: PageProps) {
  const route = routeFrom((await params).slug);
  if (!isCapturedRoute(route)) notFound();
  return <SiteShell page={capturedPages[route]} />;
}
