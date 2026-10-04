import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/workflows/")({
  head: () => ({
    meta: [
      { title: "Workflows | sidekik" },
      { name: "description", content: "Workflows your organisation captures and teaches." },
      { property: "og:title", content: "Workflows | sidekik" },
      { property: "og:description", content: "Workflows your organisation captures and teaches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon title="Workflows" />,
});
