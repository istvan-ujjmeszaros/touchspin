# Renderer Checklist (Framework Differences)

Scope: Bootstrap 3/4/5, Tailwind renderers — what each builds and how core interacts.

Common contract (all renderers)
- Add data-touchspin-injected roles:
  - wrapper, up, down, prefix, postfix (and vertical-wrapper when vertical)
- Add testids derived from input data-testid:
  - {id}-wrapper, {id}-up, {id}-down, {id}-prefix, {id}-postfix
- Build DOM and then call core.attachUpEvents/attachDownEvents
- Observe settings for reactive updates (prefix/postfix/classes/text)

Bootstrap 3
- Structure: input-group with .input-group-addon for prefix/postfix; buttons often in .input-group-btn (pre/append wrappers)
- Wrapper classes: bootstrap-touchspin + size variants via input classes
- Vertical buttons: renderer provides stacked buttons container

Bootstrap 4
- Structure: .input-group-prepend / .input-group-append; prefix/postfix inside .input-group-text
- Wrapper classes: bootstrap-touchspin + size variants via input classes
- Vertical buttons: same concept, separate vertical wrapper injected

Bootstrap 5
- Structure: direct children (no prepend/append components); prefix/postfix as .input-group-text siblings
- Wrapper classes: bootstrap-touchspin, size via input classes
- Vertical buttons: injected wrapper with stacked buttons

Tailwind
- No framework components; plain elements styled by utility classes
- Same data roles + testids; no Bootstrap-specific wrappers
- Vertical buttons: simple flex column wrapper

Notes and gotchas
- All renderers must mark the wrapper with data-touchspin-injected so core can find it for input-level interactions.
- Ensure focusability of buttons is controlled (focusablebuttons setting) — add tabindex accordingly.
- Keep ARIA labels for buttons (Increase/Decrease) — some renderers set it on init.
- Prefix/postfix may be empty; renderer should render elements but core hides empties via hideEmptyPrefixPostfix.
