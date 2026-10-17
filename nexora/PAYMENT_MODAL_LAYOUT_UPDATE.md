# NEXORA Payment Modal Layout Update

This update improves the wallet deposit modal layout without changing Paystack payment handling or NEXORA Connect order flows.

## UI changes
- Renders the wallet deposit modal through a document-level React portal so fixed positioning is tied to the viewport instead of a dashboard content/scroll container.
- Centers the dialog within the current viewport on desktop and mobile, including safe-area padding on mobile devices.
- Keeps the dialog shell fixed in place and prevents horizontal scrolling on the overlay or entire modal.
- Makes quick deposit amounts a dedicated horizontal scrolling strip, with separate left/right scroll controls and touch swipe support.
- Refines card spacing, typography, input sizing, action buttons, modal header/footer, borders, and responsive behavior for shorter screens.
- On very short screens, only the modal content area may scroll vertically; the backdrop and modal shell do not scroll away.

## Validation
- Frontend JSX syntax parsed with the installed TypeScript compiler in JSX-preserve mode.
- Backend JavaScript syntax checked with `node --check`.
- CSS selector and ZIP integrity checks should be performed after packaging.
- A complete Vite production build and browser-level visual test could not be run in this environment because project dependencies are not installed and the npm registry was unreachable.
