import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/workmaps/")({
  head: () => ({
    meta: [
      { title: "Work Maps | sidekik" },
      { name: "description", content: "Work Maps captured from your experts." },
      { property: "og:title", content: "Work Maps | sidekik" },
      { property: "og:description", content: "Work Maps captured from your experts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon title="Work Maps" />,
});
