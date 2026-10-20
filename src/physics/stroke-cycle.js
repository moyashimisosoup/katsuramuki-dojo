/**
 * Research-only kinematic stroke cycle for a selected Kyoto culinary-school
 * transcript-based practice profile. This does NOT model measured knife
 * angles, cutting force, thumb contact or blade disengagement.
 *
 * The observed instruction is PHASE ORDER only:
 * daikon rotates during the rising stroke, not the return stroke.
 * Durations, rates and stroke distances are uncalibrated game parameters.
 * State and event output are independent of Three.js and rendering FPS.
 */
export const PROFILE_ID = 'kyoto_2025_caption_phase_hypothesis';
export const DEFAULT_STROKE_SETTINGS = Object.freeze({
  upDurationSeconds: 0.8,
  returnDurationSeconds: 0.6,
  upAngularSpeedRadPerSecond: 1.2
});
const EPS = 1e-12;
function checkSettings(settings) {
  const x = {...DEFAULT_STROKE_SETTINGS, ...settings};
  for (const key of ['upDurationSeconds', 'returnDurationSeconds', 'upAngularSpeedRadPerSecond']) {
    if (!Number.isFinite(x[key])) throw new RangeError(key + ' must be finite');
  }
  if (x.upDurationSeconds <= 0 || x.returnDurationSeconds <= 0 ||
      x.upDurationSeconds > 120 || x.returnDurationSeconds > 120 ||
      x.upAngularSpeedRadPerSecond < 0 || x.upAngularSpeedRadPerSecond > 100) {
    throw new RangeError('Stroke settings outside finite simulation limits');
  }
  return Object.freeze(x);
}
export function createStrokeCycleState(settings = {}) {
  return {
    profileId: PROFILE_ID,
    settings: checkSettings(settings),
    phase: 'upstroke',
    phaseElapsedSeconds: 0,
    strokePosition01: 0,
    accumulatedRotationRad: 0,
    cyclesCompleted: 0
  };
}
function phaseDuration(state) {
  return state.phase === 'upstroke' ? state.settings.upDurationSeconds : state.settings.returnDurationSeconds;
}
function interpolatePosition(phase, elapsed, duration) {
  const t = Math.min(1, Math.max(0, elapsed / duration));
  return phase === 'upstroke' ? t : 1 - t;
}
/**
 * Consumes dt even across multiple up/return boundaries exactly.
 * Each segment is input for future material-removal orchestration.
 * cuttingCandidate !== verified contact: never infer force from this flag.
 */
export function advanceStrokeCycle(previous, dtSeconds, {active = true} = {}) {
  if (!Number.isFinite(dtSeconds) || dtSeconds < 0 || dtSeconds > 10) {
    throw new RangeError('dtSeconds must be finite, in [0,10]');
  }
  if (typeof active !== 'boolean') throw new TypeError('active must be boolean');
  if (!previous || previous.profileId !== PROFILE_ID ||
      !['upstroke', 'return'].includes(previous.phase) ||
      !Number.isFinite(previous.phaseElapsedSeconds)) {
    throw new TypeError('Invalid cycle state');
  }
  const next = {...previous};
  if (!active || dtSeconds === 0) return {state: next, segments: [], deltaAngleRad: 0};
  let remaining = dtSeconds, totalRotation = 0;
  const segments = [];
  let loops = 0;
  while (remaining > EPS) {
    if (++loops > 100000) throw new Error('Cycle transition guard');
    const duration = phaseDuration(next);
    const available = Math.max(0, duration - next.phaseElapsedSeconds);
    if (available <= EPS) {
      const wasReturn = next.phase === 'return';
      next.phase = wasReturn ? 'upstroke' : 'return';
      next.phaseElapsedSeconds = 0;
      next.strokePosition01 = wasReturn ? 0 : 1;
      if (wasReturn) next.cyclesCompleted += 1;
      continue;
    }
    const slice = Math.min(remaining, available);
    const oldElapsed = next.phaseElapsedSeconds;
    const newElapsed = oldElapsed + slice;
    const rise = next.phase === 'upstroke';
    const deltaAngleRad = rise ? next.settings.upAngularSpeedRadPerSecond * slice : 0;
    const start = interpolatePosition(next.phase, oldElapsed, duration);
    const end = interpolatePosition(next.phase, newElapsed, duration);
    segments.push({
      phase: next.phase,
      durationSeconds: slice,
      strokePositionStart01: start,
      strokePositionEnd01: end,
      deltaAngleRad,
      cuttingCandidate: rise
    });
    totalRotation += deltaAngleRad;
    next.accumulatedRotationRad += deltaAngleRad;
    remaining -= slice;
    next.phaseElapsedSeconds = newElapsed;
    next.strokePosition01 = end;
    if (next.phaseElapsedSeconds >= duration - EPS) {
      const wasReturn = next.phase === 'return';
      next.phase = wasReturn ? 'upstroke' : 'return';
      next.phaseElapsedSeconds = 0;
      next.strokePosition01 = wasReturn ? 0 : 1;
      if (wasReturn) next.cyclesCompleted += 1;
    }
  }
  return {state: next, segments, deltaAngleRad: totalRotation};
}
