import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/org/settings")({
  head: () => ({
    meta: [
      { title: "Settings | sidekik" },
      { name: "description", content: "Organisation settings for retention, languages and consent." },
      { property: "og:title", content: "Settings | sidekik" },
      { property: "og:description", content: "Organisation settings for retention, languages and consent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon title="Settings" />,
});
