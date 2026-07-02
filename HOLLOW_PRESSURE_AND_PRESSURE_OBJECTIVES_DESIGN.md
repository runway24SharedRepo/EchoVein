# EchoVein — Hollow Pressure and Pressure Objectives Design Handover

**Audience:** future LLM / JavaScript developer continuing EchoVein.  
**Purpose:** explain the intended design, runtime behaviour, data structures, pop-up messages, button behaviour, reward flow, failure conditions, and known implementation hazards around the **Hollow Pressure / Pressure Objectives v1** feature.

This document should be read before changing anything related to:

```text
Hollow Pressure
Pressure Objectives
Risk Signal popups
RISK objective HUD entries
Accept / Ignore pressure buttons
secondary / pressure reward payout
mission objective modal input handling
```

---

## 1. High-level design intention

EchoVein is an extraction-mining roguelike. The central fantasy is:

```text
Mining gives profit.
Profit creates noise.
Noise attracts danger.
The player chooses how greedy to be before extracting.
```

The **Hollow Pressure** system is the mechanical representation of that “the cave is listening” feeling.

Pressure Objectives are optional risk/reward offers that appear during a run. The player can either:

```text
Accept the signal -> take extra danger now, gain a RISK objective, claim reward only after successful extraction.
Ignore the signal -> close the popup and continue the run with no penalty and no reward.
```

The feature is intentionally **not** a full resonance system yet. It is a lightweight v1 layer built on top of the existing objective system.

---

## 2. Terminology

### Hollow Pressure

A run-level danger value stored on the game object:

```js
g.hollowPressure
```

It currently behaves as a simple pressure counter / threat marker. Accepting a pressure objective increases it.

In v1 it is mostly used for:

```text
- HUD feedback
- danger flavour
- future scaling hook
- immediate risk response trigger
```

Future systems can make Hollow Pressure influence spawn rate, enemy aggression, cave hazards, resonance effects, boss mutations, or extraction instability.

### Pressure Objective

An optional objective stored in:

```js
g.objectives
```

with:

```js
objectiveType: 'pressure'
```

Pressure objectives are shown in the objective HUD as:

```text
RISK
```

They are optional and **must never block boss spawning**.

### Risk Signal

The UI popup that offers the player a pressure objective.

The popup is a modal decision point:

```text
Accept -> create the RISK objective and apply risk.
Ignore -> dismiss the offer and resume normal gameplay.
```

### RISK objective

The HUD-visible accepted pressure objective. It behaves similarly to a secondary objective, except it is explicitly marked as a risk contract.

---

## 3. Relationship to the objective system

The stronger mission objective system supports:

```js
objectiveType: 'primary'   // required to spawn boss
objectiveType: 'secondary' // optional bonus
objectiveType: 'pressure'  // optional risk/reward
```

The boss-spawning rule is:

```text
Only completed PRIMARY objectives are required to spawn the boss.
SECONDARY and PRESSURE objectives do not block the boss.
```

The relevant helper is:

```js
allPrimaryObjectivesComplete(g)
```

Do **not** revert boss spawning to:

```js
allObjectivesComplete(g)
```

because that would make secondary and pressure objectives block progression.

---

## 4. Core runtime data structures

### Game-level pressure fields

The game object contains pressure-related state similar to:

```js
{
  hollowPressure: 0,
  pressureFlash: 0,
  pressureSystem: {
    offersSeen: 0,
    maxOffers: 2,
    nextOfferTime: 75,
    offer: null,
    modalOpen: false,
    lastModalCloseReason: '',
    lastDeclinedAt: -9999,
    activeIds: [],
    completed: 0,
    failed: 0
  }
}
```

### Field meanings

| Field | Meaning |
|---|---|
| `g.hollowPressure` | Current pressure level for this run. Accepting a pressure objective increases it. |
| `g.pressureFlash` | Short HUD feedback timer after pressure increases. |
| `pressureSystem.offersSeen` | Number of pressure offers shown this run. |
| `pressureSystem.maxOffers` | Maximum pressure offers per run. Current v1 default is `2`. |
| `pressureSystem.nextOfferTime` | Earliest run time when another risk signal can be offered. |
| `pressureSystem.offer` | Pending offer shown in the popup. `null` when no popup is pending. |
| `pressureSystem.modalOpen` | Indicates that the pressure popup is logically open. |
| `pressureSystem.lastModalCloseReason` | Debug/status field for why the modal closed. |
| `pressureSystem.lastDeclinedAt` | Run time when the player last ignored a signal. |
| `pressureSystem.activeIds` | IDs of active accepted pressure objectives. |
| `pressureSystem.completed` | Count of completed pressure objectives in this run. |
| `pressureSystem.failed` | Count of failed pressure objectives in this run. |

The state is normalised by:

```js
ensurePressureObjectiveState(g)
```

This helper must be called before reading or mutating `g.pressureSystem`.

---

## 5. Pressure objective configuration

The v1 configuration is:

```js
const PRESSURE_OBJECTIVE_CONFIG = {
  firstOfferTime: 75,
  repeatOfferDelay: 130,
  maxOffersPerRun: 2,
  maxActive: 1
};
```

### Meaning

| Setting | Meaning |
|---|---|
| `firstOfferTime` | First possible offer time in seconds after run start. |
| `repeatOfferDelay` | Cooldown after an offer is queued/ignored/accepted before another offer can appear. |
| `maxOffersPerRun` | Hard cap on number of pressure offers per run. |
| `maxActive` | Intended active pressure objective limit. v1 effectively allows only one active pressure objective because `canOfferPressureObjective()` blocks when one is active. |

---

## 6. Offer lifecycle

The pressure system runs during gameplay update.

Expected call path:

```text
update(g, dt)
  -> updatePressureObjectiveSystem(g, dt)
      -> ensurePressureObjectiveState(g)
      -> updatePressureObjectiveTimers(g, dt)
      -> canOfferPressureObjective(g)
      -> queuePressureObjectiveOffer(g)
      -> showPressureObjectiveOffer(g, offer)
```

### Offer eligibility

`canOfferPressureObjective(g)` should return true only when:

```text
- game exists
- state is playing
- boss has not spawned
- extraction is not active
- run is not resolved
- no pending offer exists
- offer count is below maxOffers
- no accepted pressure objective is currently active
- run time has reached nextOfferTime
```

Important: pressure offers should not appear during boss fights, extraction, run completion, menus, or unresolved modal states.

---

## 7. Popup behaviour design

The popup is created by:

```js
ensurePressureObjectiveOverlay()
```

and shown by:

```js
showPressureObjectiveOffer(g, offer)
```

When shown, it should:

```text
- set awaitingPressureChoice = true
- store the offer in overlay._pressureOffer as fallback
- set g.pressureSystem.modalOpen = true
- display the overlay
- enable pointer events on the overlay
- focus the accept button if possible
- refresh menu/gamepad selection if the game supports it
```

### Why `awaitingPressureChoice` matters

The game loop/input flow is designed to pause or block gameplay input while a modal choice is open. Therefore:

```text
If awaitingPressureChoice remains true after the popup should close, the game can soft-lock.
```

Any close path must explicitly set:

```js
awaitingPressureChoice = false;
```

---

## 8. Popup visual content

A pressure popup should show:

```text
- icon
- title
- subtitle explaining it is optional
- objective display name
- objective description
- target amount
- time limit
- risk text
- reward summary
- accept button
- ignore/decline button
```

The subtitle should make it clear:

```text
Optional RISK objective — accept for danger now, claim reward only after extraction.
```

The reward should not be granted immediately on accepting. It is only paid after successful extraction if the objective completed.

---

## 9. Pressure offer templates

Pressure Objectives v1 contains three templates.

### 9.1 Blood Echo Surge

| Field | Value |
|---|---|
| Template ID | `blood_echo` |
| Icon | `⚔️` |
| Popup title | `Blood Echo Surge` |
| Accept button | `Accept combat risk` |
| Ignore button | `Ignore signal` |
| Objective type | `killEnemyType` |
| HUD objective type | `pressure` / `RISK` |
| Target | Kill `18` enemies |
| Timer | `90` seconds |
| Pressure increase | `+1` Hollow Pressure |
| Immediate burst | `8` swarmers, performance-adjusted if available |
| Reward | `35` Operator XP + `4` Voltarite |

Design purpose:

```text
A combat-focused temptation. The cave offers a reward for aggressive fighting.
```

Expected accept result:

```text
- Add RISK objective to HUD
- Increase Hollow Pressure by 1
- Trigger hostile surge
- Start 90 second timer
```

Expected ignore result:

```text
- Close popup
- Do not add objective
- Do not spawn enemies
- Do not increase Hollow Pressure
```

---

### 9.2 Unstable Vein Bloom

| Field | Value |
|---|---|
| Template ID | `unstable_vein` |
| Icon | `⛏️` |
| Popup title | `Unstable Vein Bloom` |
| Accept button | `Overmine the vein` |
| Ignore button | `Leave it buried` |
| Objective type | `collectResourceTag` |
| HUD objective type | `pressure` / `RISK` |
| Target | Collect `12` rare ore units tagged as `rareOre` |
| Timer | `120` seconds |
| Pressure increase | `+1` Hollow Pressure |
| Immediate burst | `6` grunts, performance-adjusted if available |
| Reward | `30` Operator XP + `35` Gild + `2` of selected rare resource |

The rare resource is selected from:

```js
['voltarite', 'aetherQuartz', 'crysalith', 'emberglass']
```

Design purpose:

```text
A mining-greed temptation. The player can chase unstable ore under time pressure.
```

Expected accept result:

```text
- Add RISK objective to HUD
- Increase Hollow Pressure by 1
- Spawn immediate enemy response
- Start 120 second timer
- Reward is possible only after successful extraction
```

Expected ignore result:

```text
- Close popup immediately
- Resume game immediately
- Do not add the unstable vein RISK objective
- Do not increase Hollow Pressure
- Do not spawn the burst
- Do not grant reward
- Do not mark anything failed
```

This template exposed the important bug where the ignore button did not close the popup. Future LLMs must preserve the hard-close fallback described later in this document.

---

### 9.3 Fracture Overbreak

| Field | Value |
|---|---|
| Template ID | `overbreak` |
| Icon | `🪨` |
| Popup title | `Fracture Overbreak` |
| Accept button | `Force the fracture` |
| Ignore button | `Stabilise and move on` |
| Objective type | `mineBlocks` |
| HUD objective type | `pressure` / `RISK` |
| Target | Mine `24` blocks |
| Timer | `105` seconds |
| Pressure increase | `+1` Hollow Pressure |
| Immediate burst | `4` exploders, performance-adjusted if available |
| Reward | `25` Operator XP + `45` Gild |

Design purpose:

```text
A destructible-terrain temptation. The player can mine fast for reward but creates noise and enemy response.
```

---

## 10. Accept button behaviour

Accepting a pressure signal should call:

```js
acceptPressureObjectiveOffer(g, fallbackOffer)
```

Expected behaviour:

```text
1. Read the current offer from g.pressureSystem.offer or fallbackOffer.
2. If the offer is missing/stale, close the modal safely and resume gameplay.
3. Normalise the offer objective.
4. Set acceptedAt to current run time.
5. Ensure timeRemaining and timeLimit exist.
6. Push the objective into g.objectives if not already present.
7. Add objective ID to g.pressureSystem.activeIds.
8. Clear g.pressureSystem.offer.
9. Apply risk using applyPressureObjectiveRisk(g, offer).
10. Hide/hard-close the pressure modal.
```

### Accept must apply risk

`applyPressureObjectiveRisk(g, offer)` should:

```text
- increase g.hollowPressure by offer.pressureIncrease
- set g.pressureFlash for HUD feedback
- spawn a burst if burstCount > 0
- log that the risk was accepted
- play a sound if available
```

### Accept must not grant reward immediately

Reward is deferred until successful extraction/run completion.

---

## 11. Ignore / decline button behaviour

This is critical.

Ignoring a pressure signal should call:

```js
declinePressureObjectiveOffer(g, fallbackOffer)
```

Expected design behaviour:

```text
Do not accept the pressure objective.
Close the popup.
Resume the game immediately.
Do not add any RISK objective to g.objectives.
Do not increase Hollow Pressure.
Do not spawn enemies.
Do not give reward.
Do not count the ignored signal as failed.
Do not block boss spawning.
Do not block extraction.
Start a cooldown before another pressure offer can appear.
```

The intended state after ignoring is:

```js
awaitingPressureChoice = false;
g.pressureSystem.offer = null;
g.pressureSystem.modalOpen = false;
g.pressureSystem.lastModalCloseReason = 'declined';
g.pressureSystem.lastDeclinedAt = g.time;
g.pressureSystem.nextOfferTime = Math.max(
  g.pressureSystem.nextOfferTime,
  g.time + PRESSURE_OBJECTIVE_CONFIG.repeatOfferDelay
);
```

The popup DOM should also be forcibly hidden:

```js
overlay._pressureOffer = null;
overlay.classList.remove('show');
overlay.setAttribute('aria-hidden', 'true');
overlay.style.display = 'none';
overlay.style.pointerEvents = 'none';
```

### Ignore is not failure

Ignoring a pressure signal is a valid strategic choice. It is not a failed objective because no objective was accepted.

Do not create a failed `pressure` objective when the player ignores a signal.

---

## 12. Hard-close safety path

A dedicated hard-close function exists / should exist:

```js
hardClosePressureObjectiveOffer(reason = 'closed')
```

Purpose:

```text
Absolute escape hatch for the pressure modal.
It prevents soft-locks if the popup state, stored offer, or browser input event path becomes inconsistent.
```

Expected hard-close behaviour:

```js
awaitingPressureChoice = false;

if (game?.pressureSystem) {
  game.pressureSystem.offer = null;
  game.pressureSystem.modalOpen = false;
  game.pressureSystem.lastModalCloseReason = reason;
}

const overlay = document.getElementById('pressureObjectiveOverlay');
if (overlay) {
  overlay._pressureOffer = null;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.display = 'none';
  overlay.style.pointerEvents = 'none';
}
```

This function must remain available because the pressure popup blocks gameplay while open. Any unclosed modal can soft-lock the game.

---

## 13. Input handling design for the popup

The pressure popup should support redundant input paths.

### Required input paths

```text
Mouse click on button
Pointer up on button
Touch end on button
Direct onclick fallback
Overlay-level delegated click
Overlay-level delegated pointerup
Overlay-level delegated touchend
Document capture fallback
Keyboard/controller accept
Keyboard/controller decline
```

### Why so many paths?

Browser wrappers, touch devices, game embeds, and Electron/webview-like shells may suppress synthetic `click` events after pointer/touch handling.

The ignore button previously failed because the close path was too dependent on the normal click/CSS class path. The fix is to make choice handling redundant and to hard-close on decline.

### Button markers

Buttons should carry:

```html
<button data-pressure-choice="accept">...</button>
<button data-pressure-choice="decline">...</button>
```

Choice detection should not rely on `instanceof Element`, because different browser realms/iframes can make `instanceof` checks unreliable.

Use a manual parent walk:

```js
function pressureObjectiveChoiceElement(target) {
  let node = target;
  while (node && node !== document) {
    if (node.dataset && node.dataset.pressureChoice) return node;
    node = node.parentElement || node.parentNode;
  }
  return null;
}
```

---

## 14. Keyboard / controller behaviour

While the pressure modal is open:

### Accept equivalents

```text
Enter
Space
A
Y
controller confirm path, if available
```

### Decline equivalents

```text
Escape
Backspace
B
N
controller cancel path, if available
```

These shortcuts should resolve the modal directly because gameplay input is blocked while the popup is open.

Do not let these keys fall through into shooting, dashing, mining, or menu scrolling while the pressure popup is active.

---

## 15. CSS requirements

The pressure overlay should be above normal HUD panels and should be fully non-interactive when hidden.

Essential CSS behaviour:

```css
.pressureObjectiveOverlay {
  z-index: high-enough-to-be-above-HUD;
  pointer-events: auto;
}

.pressureObjectiveOverlay:not(.show) {
  display: none !important;
  pointer-events: none !important;
}

.pressureObjectiveChoices button {
  touch-action: manipulation;
}
```

When the overlay is visible, it should block gameplay clicks. When hidden, it must not capture any pointer input.

---

## 16. Pressure objective progress and failure

Accepted pressure objectives are normal objectives in `g.objectives` with:

```js
objectiveType: 'pressure'
```

They are progressed by existing objective hooks.

| Objective type | Progress source |
|---|---|
| `killEnemyType` | Enemy death handling. Used by Blood Echo Surge. |
| `collectResourceTag` | Resource collection/mining hooks. Used by Unstable Vein Bloom. |
| `mineBlocks` | Mining/block destruction hooks. Used by Fracture Overbreak. |

### Timers

Pressure objective timers are updated by:

```js
updatePressureObjectiveTimers(g, dt)
```

Each active pressure objective can have:

```js
o.params.timeLimit
o.params.timeRemaining
```

Every update:

```js
o.params.timeRemaining = Math.max(0, o.params.timeRemaining - dt);
```

If time reaches zero before completion:

```js
failPressureObjective(g, o, 'The risk timer expired.');
```

### Failure behaviour

A failed pressure objective should:

```text
- set o.failed = true
- not pay reward
- remove its ID from activeIds
- increment pressureSystem.failed
- optionally increment runStats.objectivesFailed
- show/log Risk failed feedback
- not fail the entire run
- not block boss spawning
- not block extraction
```

Note: Holdout drill failure is a separate mission-world-hook rule. Pressure objective failure should not automatically fail the run.

---

## 17. Reward behaviour

Pressure objective rewards are paid together with optional objective rewards after successful run completion/extraction.

Relevant helper:

```js
applyCompletedSecondaryObjectiveRewards(g)
```

Despite the name, it handles both:

```js
objectiveType === 'secondary'
objectiveType === 'pressure'
```

### Reward rules

```text
Completed pressure objective + successful extraction -> reward granted.
Incomplete pressure objective -> no reward.
Failed pressure objective -> no reward.
Ignored pressure signal -> no objective exists, so no reward.
Accepted but run failed -> no reward.
```

### Reward object format

```js
{
  xp: 25,
  resources: {
    gild: 20,
    voltarite: 5
  }
}
```

### Resource key mapping

Reward resources may use run-style keys. The reward mapper converts known keys into profile resource keys:

```text
gild -> gildShards
echo -> echoQuartz
voltarite -> voltarite
aetherQuartz -> aetherQuartz
```

Invalid reward keys should be skipped instead of crashing.

### Double-reward prevention

Each objective should receive:

```js
objective.rewardClaimed = true;
```

after reward payout.

Do not grant reward immediately on completion, because the game is an extraction roguelike. The player must extract successfully.

---

## 18. HUD behaviour

Accepted pressure objectives should render as normal objective rows with:

```text
RISK
```

They should be visually distinct:

```text
RISK = purple/magenta
completed = green
failed = muted red/grey
```

The objective HUD should also display remaining timer when present:

```text
[RISK] Blood Echo Surge 7 / 18 · 1:12
```

Pressure objectives with rewards should show a badge like:

```text
Risk Reward
```

The general HUD also has a Hollow Pressure chip:

```text
Hollow Pressure: N
```

When pressure increases, `g.pressureFlash` can cause danger highlighting.

---

## 19. Mission-status panel fade interaction

A separate regression happened while working on pressure overlays: the mission/right status panel stopped fading when the player was underneath it.

The intended behaviour is:

```text
If the player character is visually under the right mission/status panel, fade the panel.
When the player moves away, restore the panel.
```

Important implementation detail:

```text
Player coordinates are in logical canvas/world space.
DOM panel bounds are in screen pixels.
```

Therefore, the player position must be converted using the fixed logical viewport transform before comparing with the DOM rectangle:

```js
screenX = VIEW.left + playerLogicalX * VIEW.scale;
screenY = VIEW.top  + playerLogicalY * VIEW.scale;
```

Do not compare logical coordinates directly against DOM `getBoundingClientRect()` pixels. That breaks on scaled/centered 1600×900 viewport layouts.

---

## 20. Protected systems: do not casually rewrite

Future LLMs should avoid modifying these unless the task explicitly requires it:

```text
1600×900 logical viewport
large-monitor scaling
mouse coordinate mapping
menu scrolling / bouncing fixes
controller menu navigation
mouse wheel menu scrolling
left-stick / D-pad menu scrolling
mobile runtime detection
mobile virtual joystick
mobile manual-targeting lock
Electron build config
mission boss/extraction flow
enemy pathfinding
objective primary-only boss-spawn rule
```

Pressure popup fixes should be narrow and should not rewrite the whole input system.

---

## 21. Known implementation hazards

### Hazard 1 — Popup soft-lock

If any path leaves:

```js
awaitingPressureChoice === true
```

while the overlay is no longer supposed to be open, the run can freeze.

Mitigation:

```text
Always hard-close on decline and stale accept.
```

### Hazard 2 — Ignore button must not rely only on click

Touch devices and wrappers may suppress `click`.

Mitigation:

```text
Use click + pointerup + touchend + delegated capture handlers.
```

### Hazard 3 — Stale offer state

`g.pressureSystem.offer` and `overlay._pressureOffer` can become out of sync.

Mitigation:

```text
Use fallback offer for accept/decline, but decline must close even with no offer.
```

### Hazard 4 — Immediate re-open after ignore

If `nextOfferTime` is not pushed forward, a new offer may appear immediately after ignoring.

Mitigation:

```js
st.nextOfferTime = Math.max(st.nextOfferTime, g.time + PRESSURE_OBJECTIVE_CONFIG.repeatOfferDelay);
```

### Hazard 5 — Reward abuse

If reward is granted on objective completion instead of extraction, the player can die after claiming reward.

Mitigation:

```text
Grant pressure rewards only from run completion/extraction flow.
```

---

## 22. Manual test checklist

Run these tests before proceeding to the next design feature.

### 22.1 Popup open test

```text
Start a run.
Wait until first risk signal appears.
Confirm the popup appears and gameplay pauses.
Confirm the title, target, time limit, risk, reward, and two buttons are visible.
```

### 22.2 Ignore signal test

For every template:

```text
Click/tap Ignore signal / Leave it buried / Stabilise and move on.
Expected:
- popup closes immediately
- player can move immediately
- no RISK objective appears
- Hollow Pressure does not increase
- no burst spawns
- no reward is granted
- no failure is logged
- another popup does not immediately reappear
```

### 22.3 Accept signal test

For every template:

```text
Click/tap accept button.
Expected:
- popup closes immediately
- RISK objective appears in HUD
- Hollow Pressure increases by 1
- enemy burst spawns if performance rules allow it
- timer appears in HUD
- gameplay resumes
```

### 22.4 Timer failure test

```text
Accept a pressure objective.
Do not complete it.
Wait for timer to expire.
Expected:
- RISK objective becomes failed
- no reward is granted
- run continues
- boss/extraction flow is not blocked
```

### 22.5 Reward test

```text
Accept a pressure objective.
Complete it.
Defeat boss / extract successfully.
Expected:
- reward is granted during run completion
- run summary lists Bonus / Risk Objective Rewards
- rewardClaimed prevents duplicate payout
```

### 22.6 Boss-spawn compatibility test

```text
Accept a pressure objective.
Ignore or fail it.
Complete all primary objectives.
Expected:
- boss still spawns
```

### 22.7 Mission panel fade regression test

```text
Move character under mission/status panel.
Expected panel fades.
Move away.
Expected panel reappears.
```

### 22.8 Mobile/touch test

```text
Open pressure popup on touch device or browser emulator.
Tap ignore.
Expected popup closes.
Tap accept on another run.
Expected RISK objective starts.
Virtual joystick should remain unaffected after popup closes.
```

---

## 23. Suggested future design: Hollow Pressure v2 / Resonance

Pressure Objectives v1 only increments a pressure counter and spawns an immediate burst.

Future Hollow Pressure should turn the counter into a full dynamic system.

### Possible future rules

```text
Pressure 0: normal cave behaviour
Pressure 1: minor enemy response increase
Pressure 2: more frequent ambushes / louder mining response
Pressure 3: elite patrols / mineral resonance hazards
Pressure 4+: boss modifiers, extraction instability, cave pulses
```

### Future systems to add

```text
resonance meter from mining
pressure decay or stabilisation zones
mission mutators based on pressure level
pressure-specific enemy waves
pressure-specific visual/audio cave pulses
off-screen warnings for pressure events
operator upgrades that reduce/redirect pressure
pressure objective chaining
```

Do not implement these inside Pressure Objectives v1 bugfixes. They belong to a separate design pass.

---

## 24. How to add a new pressure objective template

Add a new template inside `buildPressureObjectiveOffer(g)`.

A template should include:

```js
{
  templateId: 'unique_template_id',
  icon: '⚠️',
  title: 'Readable Popup Title',
  riskText: 'What danger accepting creates.',
  acceptText: 'Accept button text',
  ignoreText: 'Ignore button text',
  burstType: 'enemyType',
  burstCount: 4,
  pressureIncrease: 1,
  objective: createObjective({
    id: `pressure_unique_${Math.floor(g.time || 0)}`,
    type: 'supportedProgressType',
    objectiveType: 'pressure',
    optional: true,
    displayName: '⚠️ HUD objective name',
    description: 'RISK objective. Explain objective and extraction reward rule.',
    targetAmount: 10,
    currentAmount: 0,
    reward: { xp: 25, resources: { gild: 20 } },
    params: { timeLimit: 90, timeRemaining: 90, templateId: 'unique_template_id' },
    tags: ['pressure', 'risk']
  })
}
```

### Rules for new templates

```text
- Use objectiveType: 'pressure'.
- Use optional: true.
- Always include a time limit unless the design intentionally supports no-timer risks.
- Use supported objective progress types or add the progress hook first.
- Include reward, but remember it is paid only after extraction.
- Include clear accept/ignore text.
- Do not make pressure objectives block boss spawning.
- Do not fail the run when a pressure objective fails.
```

---

## 25. Current supported pressure progress types

Known supported types from the current implementation:

```text
killEnemyType
collectResourceTag
mineBlocks
```

Other objective types exist in the broader mission system, but only use them for pressure if their progress hooks are verified.

---

## 26. Recommended next LLM prompt after this document

Use this only after the pressure popup is verified stable:

```text
You are a senior JavaScript gameplay developer working on EchoVein.
Before adding new features, audit the current Hollow Pressure and Pressure Objectives v1 implementation.
Verify the Accept and Ignore popup paths, keyboard/controller/touch handling, RISK objective progress, timeout failure, reward payout on extraction, and primary-only boss spawning.
Do not add new mechanics yet. Produce a concise risk report and identify any remaining regressions.
```

After that audit passes, continue with:

```text
Hollow Pressure / Resonance System v2
```

---

## 27. Summary for future LLM

```text
Hollow Pressure is the cave danger counter.
Pressure Objectives are optional RISK contracts.
The popup offers a choice.
Accept creates a timed RISK objective, raises Hollow Pressure, and applies immediate danger.
Ignore must close the popup immediately and resume the game with no objective, no risk, no reward, and no failure.
Rewards are only granted after successful extraction.
Pressure objectives must never block boss spawning.
The pressure popup needs redundant event handling and a hard-close fallback to avoid soft-locks.
```
