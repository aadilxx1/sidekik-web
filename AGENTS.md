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
- Auth is Supabase email magic link on our own connected Supabase project. Never enable Lovable Cloud.
- Read data with the Supabase client (RLS protects it). Never write to Supabase from the browser: every create/update goes through our API at `API_URL` from `src/lib/config.ts`, with the Supabase access token as Bearer auth.
- Don't create or change database tables; they already exist.
- Don't modify these hand-written files: everything in `src/capture/`, `src/sandbox/domEvents.ts`, `src/sandbox/presave.ts`, `src/sandbox/invoiceState.ts`, `src/sandbox/contract.ts`, `src/lib/reconnectingSocket.ts`, `src/lib/config.ts`, `src/hooks/useScreenCapture.ts`.
- In `src/routes/capture.$sid.tsx`, `src/routes/sandbox.erp.tsx` and `src/routes/tutor.$sid.tsx` keep all existing logic (screen capture, DOM events, presave, the `?t`, `?sid` and `?mode` search params, Open MiniERP buttons); only change layout and styling there.
- The routes `/login`, `/sandbox/erp` and `/agent-host/$sid` render full-screen without the AppShell sidebar.
- Session and org membership come from `AuthProvider` (`src/lib/auth.tsx`); the signed-out redirect to `/login` happens in `AppShell`, because the room routes must stay at their current top-level paths.
- Reads of backend tables go through the untyped `db` client in `src/lib/db.ts` until the generated Supabase types include them.
