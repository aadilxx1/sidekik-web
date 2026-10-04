import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/people")({
  head: () => ({
    meta: [
      { title: "People | sidekik" },
      { name: "description", content: "Experts and learners in your organisation." },
      { property: "og:title", content: "People | sidekik" },
      { property: "og:description", content: "Experts and learners in your organisation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon title="People" />,
});
