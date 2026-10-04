import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/sessions")({
  head: () => ({
    meta: [
      { title: "Sessions | sidekik" },
      { name: "description", content: "Capture and tutor sessions with their timelines." },
      { property: "og:title", content: "Sessions | sidekik" },
      { property: "og:description", content: "Capture and tutor sessions with their timelines." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ComingSoon title="Sessions" />,
});
