# Test Debugging Guide for Bootstrap TouchSpin

This guide provides a systematic approach for investigating and fixing test failures in the Bootstrap TouchSpin project. The methodology documented here was used to successfully fix the input sanitization timing bug and other behavioral parity issues.

## Understanding the Test Architecture

When tests fail, they're usually comparing behavior between:
- **Original plugin**: v4.7.3 monolithic jQuery plugin (the reference implementation)
- **New architecture**: Modern core + renderer system (what we're fixing)

The goal is to achieve 100% behavioral parity between the original and new implementations.

## Key Reference Files

### Original Implementation Reference
```
__tests__/html/assets/jquery.bootstrap-touchspin-v4.7.3-original.js
```
This is the **gold standard** - the original v4.7.3 plugin that defines expected behavior. When tests fail, compare against this file to understand:
- Event handling patterns (what events are listened to)
- Sanitization timing (when values are validated/corrected)
- Event emission order (sequence of touchspin.on.* events)
- DOM manipulation approach
- State management patterns
- Callback invocation timing

### A/B Comparison Page
```
__tests__/html-package/ab-compare.html
```
Interactive side-by-side comparison of original vs new implementation. Use this to:
- Manually test behavior differences
- See visual rendering differences
- Debug event sequences
- Verify fixes in real-time

### Modern Core Implementation
```
packages/core/src/index.js
```
The new framework-agnostic core that should match original behavior.

## Systematic Debugging Process

### Step 1: Identify What's Different
When a test fails (e.g., "Typing 77 shows 77 until blur, then snaps to 75"):
1. **Check test expectations**: What should happen? (e.g., "77" should be visible while typing)
2. **Check actual results**: What actually happens? (e.g., "55" appears instead)
3. **Categorize the bug**: This tells you the nature of the problem (e.g., premature sanitization)

### Step 2: Find the Original Behavior
Search the original file for relevant patterns:

#### Event Handler Discovery
```bash
# Find blur event handling
grep -n "\.on.*blur\|\.blur" __tests__/html/assets/jquery.bootstrap-touchspin-v4.7.3-original.js

# Find input/change event handling  
grep -n "\.on.*input\|\.on.*change" __tests__/html/assets/jquery.bootstrap-touchspin-v4.7.3-original.js

# Find keydown/keyup handling
grep -n "keydown\|keyup" __tests__/html/assets/jquery.bootstrap-touchspin-v4.7.3-original.js

# Find sanitization calls
grep -n "_checkValue\|checkValue" __tests__/html/assets/jquery.bootstrap-touchspin-v4.7.3-original.js
```

#### Event Emission Discovery
```bash
# Find event trigger patterns
grep -n "\.trigger.*touchspin" __tests__/html/assets/jquery.bootstrap-touchspin-v4.7.3-original.js

# Find specific event types
grep -n "startspin\|stopspin\|startupspin\|startdownspin" __tests__/html/assets/jquery.bootstrap-touchspin-v4.7.3-original.js
```

### Step 3: Compare with New Implementation
In `packages/core/src/index.js`, look for corresponding patterns:

#### Key Questions to Answer
1. **Which events are listened to?** 
   - Original vs new event listener setup
   - Are we listening to too many events? Too few?

2. **When is sanitization triggered?**
   - Original: `_checkValue()` calls
   - New: `this._checkValue()` calls
   - Compare timing and triggers

3. **What triggers value updates?**
   - Button clicks, keyboard events, programmatic calls
   - When do values get written to the input?

4. **Event emission patterns**
   - Which events are emitted and when?
   - What's the sequence of events?

### Step 4: Common Bug Patterns

#### Pattern 1: Over-eager Sanitization
**Symptom**: Values snap to step boundaries while typing  
**Example**: Typing "77" immediately becomes "75"  
**Original behavior**: Only sanitizes on blur/Enter/Tab  
**Investigation**: Check what events trigger `_checkValue()`  
**Common fix**: Remove `input` event listener, use `blur` instead

#### Pattern 2: Missing Events
**Symptom**: Tests expect certain `touchspin.on.*` events that don't fire  
**Example**: Missing `startupspin` event after `startspin`  
**Original behavior**: Check exact event names and emission points  
**Investigation**: Trace through original's button/key handlers  
**Common fix**: Add missing `emit()` calls at correct locations

#### Pattern 3: Wrong Event Order
**Symptom**: Events fire in different sequence than original  
**Example**: `change` before `startspin` instead of after  
**Original behavior**: Trace through original's execution flow  
**Investigation**: Log event sequences in both implementations  
**Common fix**: Reorder `emit()` calls to match original

#### Pattern 4: State Management Issues
**Symptom**: Values don't update correctly or at wrong times  
**Example**: Button clicks don't increment value  
**Original behavior**: Check when values are read/written  
**Investigation**: Compare `getValue()` and value setting logic  
**Common fix**: Ensure constraints are applied at same points as original

#### Pattern 5: DOM Event Handling Differences
**Symptom**: UI interactions behave differently  
**Example**: Mouse events don't start/stop spinning correctly  
**Original behavior**: Check DOM event attachment in original  
**Investigation**: Verify element selection and event binding  
**Common fix**: Match original's event binding patterns

#### Pattern 6: Double Change Event Issue
**Symptom**: Multiple change events fired for single user action  
**Example**: Typing "407" then blur shows `change[407]` + `change[100]` instead of just `change[100]`  
**Original behavior**: Original's `_checkValue()` NEVER triggers change events - only updates value silently  
**Investigation**: Check if sanitization logic is manually dispatching change events  
**Root cause**: New core calls `_setDisplay(value, true)` which dispatches change event, but browser ALSO fires native change event on blur  
**Common fix**: Let browser handle change events naturally, don't manually dispatch during sanitization

## Testing Approach Guidelines

### Critical Rules
1. **Never run tests autonomously** - Wait for explicit user request
2. **Always use `--reporter=list`** when running tests to prevent HTML report server from hanging:
   - `npm test -- --reporter=list` instead of just `npm test`
   - This prevents the command from starting a server that never exits
3. **Use A/B tests** for parity checking:
   - `__tests__/abCompare.test.ts` - Basic parity tests
   - `__tests__/abParitySequences.test.ts` - Complex sequences
4. **Manual verification** with `ab-compare.html` page
5. **Target specific test files** that relate to the bug area

### A/B Test Strategy
The A/B comparison tests are the most reliable way to verify behavioral parity:
- They run identical operations on both original and new implementations
- They compare results directly
- They test real user interaction patterns
- They catch subtle timing and sequencing issues

## Real-World Example: Input Sanitization Fix

This is the exact process used to fix the sanitization timing bug:

### Problem Discovery
- **Test failure**: `expect("77").toBe("77")` but received `"55"`
- **Symptom**: Values being sanitized on every keystroke
- **Category**: Over-eager sanitization (Pattern 1)

### Investigation Process
1. **Found original behavior**:
   ```javascript
   // Line 346-348 in original
   originalinput.on('blur.touchspin', function () {
     _checkValue();
   });
   ```
   Only sanitizes on blur, NOT on input events.

2. **Found new implementation problem**:
   ```javascript
   // Lines 714-715 in new core
   this.input.addEventListener('input', this._handleInputChange);
   this.input.addEventListener('change', this._handleInputChange);
   ```
   Was sanitizing on every keystroke via `input` event.

3. **Confirmed original has no input listener**:
   ```bash
   grep -n "\.on.*input" __tests__/html/assets/jquery.bootstrap-touchspin-v4.7.3-original.js
   # No results - original doesn't listen to input events!
   ```

### Solution Applied
1. Removed `input` and `change` event listeners
2. Added `blur` event listener  
3. Renamed handler to `_handleInputBlur`
4. Now users can type "77" and see it until blur, then it snaps to "75"

### Verification
- A/B comparison tests now pass
- Manual testing with `ab-compare.html` confirms identical behavior
- Both implementations show "77" while typing, sanitize to "75" on blur

## Real-World Example 2: Double Change Event Issue

This demonstrates Pattern 6 (Double Change Event Issue):

### Problem Discovery
- **Test failure**: Expected 1 change event, received 2
- **Symptom**: Wrapper shows `change[407]` + `change[100]`, original shows only `change[100]`
- **Category**: Multiple change events (Pattern 6)

### Investigation Process
1. **Found original behavior**:
   ```javascript
   // Lines 519-554 in original _checkValue()
   function _checkValue() {
     // ... sanitization logic ...
     originalinput.val(returnval);  // Only updates value, NO change event
   }
   ```
   Original NEVER triggers change events during sanitization.

2. **Found new implementation problem**:
   ```javascript  
   // Line 775 in new core
   _handleInputBlur(e) {
     this._checkValue(true);  // This triggers change event manually
   }
   ```
   New core calls `_setDisplay(value, true)` which dispatches change event.

3. **Understanding the conflict**:
   - Browser naturally fires change event on blur when value differs from focus
   - New core ALSO manually fires change event during sanitization  
   - Result: Two change events for one user action

### Root Cause Analysis
The original relies on browser's native change event mechanism:
- User types "407" (focus value: "40")
- Blur occurs: `_checkValue()` silently updates to "100"  
- Browser compares: "100" !== "40", fires ONE `change[100]` event

The new core incorrectly adds a manual change event on top of the natural one.

### Solution Applied
The fix requires modifying blur handling to not manually trigger change events during sanitization, letting the browser handle it naturally.

## Key Investigation Commands

### Search Original Implementation
```bash
# Find all event listeners
grep -n "\.on(" __tests__/html/assets/jquery.bootstrap-touchspin-v4.7.3-original.js

# Find function definitions
grep -n "function.*(" __tests__/html/assets/jquery.bootstrap-touchspin-v4.7.3-original.js

# Find value operations
grep -n "\.val(" __tests__/html/assets/jquery.bootstrap-touchspin-v4.7.3-original.js

# Find event triggers
grep -n "\.trigger(" __tests__/html/assets/jquery.bootstrap-touchspin-v4.7.3-original.js
```

### Search New Implementation
```bash
# Find event listeners in core
grep -n "addEventListener\|removeEventListener" packages/core/src/index.js

# Find emit calls
grep -n "\.emit(" packages/core/src/index.js

# Find value operations
grep -n "_setDisplay\|getValue\|setValue" packages/core/src/index.js
```

## Success Metrics

A successful fix should result in:
1. **A/B tests pass**: Both `abCompare.test.ts` and `abParitySequences.test.ts`
2. **Identical behavior**: Manual testing shows same results on both sides
3. **No regressions**: Other tests continue to pass
4. **Event parity**: Same events fired in same sequence
5. **State parity**: Values updated at same times with same results

## Documentation of Fixes

When documenting a fix, include:
1. **Problem description**: What was failing and why
2. **Investigation findings**: What was different between original and new
3. **Root cause**: The specific code causing the behavioral difference
4. **Solution applied**: Exact changes made to fix the issue
5. **Verification method**: How the fix was confirmed to work

This systematic approach ensures consistent, thorough debugging and maintains behavioral parity with the original TouchSpin plugin.