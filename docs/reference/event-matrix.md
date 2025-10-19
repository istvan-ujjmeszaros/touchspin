# Event Matrix

## Core Events

### Standard Events
- `change` - Native change event when value actually changes
- `min` - Fired when minimum boundary is reached
- `max` - Fired when maximum boundary is reached
- `startspin` - Fired at the beginning of any spin operation
- `startupspin` - Fired when starting an up spin
- `startdownspin` - Fired when starting a down spin
- `stopupspin` - Fired when stopping an up spin
- `stopdownspin` - Fired when stopping a down spin
- `stopspin` - Fired at the end of any spin operation
- `boostchange` - Fired when boost level changes (payload: `{ level, step, capped }`)

### New Events (v5.0.1-alpha.7)

#### Cancelable Change Events
- `change:start` - Fired before a change occurs, **cancelable** with `event.preventDefault()`
- `change:end` - Fired after a change completes, **cancelable** with `event.preventDefault()`

#### Speed Change Events
- `speedchange` - Fired when spin speed changes between normal/fast modes
  - Payload: `{ speed: 'normal' | 'fast', previousSpeed: 'normal' | 'fast' }`

## Wrapper Events (jQuery)

All core events are mapped to jQuery-style events:
- `touchspin.on.min`
- `touchspin.on.max`
- `touchspin.on.startspin`
- `touchspin.on.startupspin`
- `touchspin.on.startdownspin`
- `touchspin.on.stopupspin`
- `touchspin.on.stopdownspin`
- `touchspin.on.stopspin`
- `touchspin.on.boostchange`
- `touchspin.on.change:start` (cancelable)
- `touchspin.on.change:end` (cancelable)
- `touchspin.on.speedchange`

## Event Timing

- `startspin` then `startupspin`|`startdownspin` at spin start
- `min`/`max` BEFORE setting display when reaching boundary via single step
- `stopupspin`|`stopdownspin` then `stopspin` at spin end
- `change:start` fires before any value change (cancelable)
- `change` fires when display actually changes via `_setDisplay()`
- `change:end` fires after change completes (cancelable)
- `speedchange` fires when transitioning between normal/fast spin speeds

## Cancelable Events

Events marked as **cancelable** can be prevented by calling `event.preventDefault()`:

```javascript
input.addEventListener('change:start', (event) => {
  // Prevent the change from happening
  if (someCondition) {
    event.preventDefault();
  }
});
```

To enable cancelable events, set the `cancelable` option to `true`:

```javascript
TouchSpin(input, {
  cancelable: true,  // Enable cancelable change events
  // ... other options
});
```

## Change Event Handling

- Core dispatches native `change` when display actually changes via `_setDisplay()`
- Core intercepts native `change` in capture to prevent propagation of unsanitized values
- `blur`/`Enter` apply sanitization and emit final `change`
- Cancelable events (`change:start`, `change:end`) allow preventing changes entirely


