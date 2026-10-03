<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

// ============= Project rules =============

- The app shell (sidebar + content area) lives in `src/components/AppShell.tsx` and is mounted once in `src/routes/__root.tsx` around the router's outlet; add nav links and new routes there rather than creating a second layout.
- Frontend only by design: no Lovable Cloud, no auth, no backend — keep all features client-side unless the user changes this.
