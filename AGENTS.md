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

## Architecture rules
- Keep the reference experience as a single scrolling index route with anchored sections, because the uploaded website transitions continuously between sections.
- Use a lazy client-only Three.js sculpture with a generated image fallback, so SSR stays safe and the first view is immediately visible.
- Submit inquiries through a validated server function to a service-role-only table, because visitor messages must never be readable publicly.
- Define visual styling in the global semantic design system and use shared design-system controls for interactions.
- Keep personal portfolio sections in a focused shared component with accessible project and article dialogs, because the reference remains one continuous scrolling experience.
- Source technology logo paths from Simple Icons, because recognizable brand marks should not be approximated by generic icons.
