import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sidekik" },
      { name: "description", content: "Sidekik — your workspace." },
      { property: "og:title", content: "Sidekik" },
      { property: "og:description", content: "Sidekik — your workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <div className="h-full" />;
}
