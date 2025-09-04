# Renderer Audit Checklist

Contract compliance
- [ ] Adds data-touchspin-injected roles: wrapper, up, down, prefix, postfix (plus vertical-wrapper when vertical).
- [ ] Adds testids derived from input data-testid: {id}-wrapper, {id}-up, {id}-down, {id}-prefix, {id}-postfix.
- [ ] Calls core.attachUpEvents/attachDownEvents on created buttons.
- [ ] Subscribes to core.observeSetting for: prefix, postfix, button text/classes, vertical classes/text.
- [ ] Provides teardown(): removes injected elements or unwraps advanced containers safely.

Framework layout
- [ ] Bootstrap 3: uses input-group and .input-group-addon/.input-group-btn wrappers.
- [ ] Bootstrap 4: uses .input-group-prepend/.input-group-append and .input-group-text.
- [ ] Bootstrap 5: uses plain children under .input-group; .input-group-text siblings.
- [ ] Tailwind: plain elements styled via utility classes; no Bootstrap structure.

Accessibility
- [ ] Button ARIA labels present (Increase value / Decrease value).
- [ ] tabindex honors focusablebuttons setting (0 vs -1).
- [ ] Visual order consistent for RTL when applicable (renderer should be layout-agnostic or provide RTL class support).

Behavioral
- [ ] No direct DOM event logic inside renderer beyond initial build; core handles events via attachUp/Down.
- [ ] Prefix/postfix elements rendered even if empty; core hides empties.
- [ ] Vertical buttons: injected wrapper around input or as adjacent sibling consistent with framework.
- [ ] Does not mutate input value during init; formatting handled by core.

Teardown
- [ ] Removes all injected elements.
- [ ] Restores input position in DOM where applicable (advanced wrappers).
- [ ] Leaves no dangling event handlers or MutationObservers.

