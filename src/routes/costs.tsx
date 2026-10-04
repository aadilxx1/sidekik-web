import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/costs")({
  head: () => ({
    meta: [
      { title: "Costs | sidekik" },
      { name: "description", content: "Cost per Sidekik session." },
      { property: "og:title", content: "Costs | sidekik" },
      { property: "og:description", content: "Cost per Sidekik session." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon title="Costs" />,
});
