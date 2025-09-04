# Options and Data Attributes

- min (data-bts-min)
  - number|null; default 0; null removes lower bound.
- max (data-bts-max)
  - number|null; default 100; null removes upper bound.
- step (data-bts-step)
  - number; default 1; must be >0; step divisibility rules apply to formatting.
- decimals (data-bts-decimals)
  - integer ≥0; default 0; display precision.
- stepinterval (data-bts-step-interval)
  - ms between repeats when holding; default 100.
- stepintervaldelay (data-bts-step-interval-delay)
  - initial delay before repeating; default 500.
- forcestepdivisibility (data-bts-force-step-divisibility)
  - 'round'|'floor'|'ceil'|'none'; default 'round'; formatting not physics.
- booster (data-bts-booster)
  - boolean; default true; enables boosted stepping during hold.
- boostat (data-bts-boostat)
  - integer ≥1; default 10; steps before boost level increases.
- maxboostedstep (data-bts-max-boosted-step)
  - number|false; default false; caps boosted step.
- mousewheel (data-bts-mouse-wheel)
  - boolean; default true; active only when input is focused.
- prefix/postfix (+ _extraclass) (data-bts-prefix|postfix|prefix-extra-class|postfix-extra-class)
  - strings; renderer-only visuals; reactive via core.observeSetting.
- verticalbuttons (+ classes/text) (data-bts-vertical-buttons|vertical-up|vertical-down|...)
  - renderer controls; core only attaches events.
- initval/replacementval/firstclickvalueifempty
  - init/display helpers for empty values.

Notes
- Native attributes min/max/step also influence settings with precedence and are kept in sync (type="number").
- Legacy and core share option semantics; core adds robust sanitization.
