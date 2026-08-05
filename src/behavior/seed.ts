/**
 * Seeded event generator — plays a handful of learner archetypes through the
 * catalogue and records everything they do as Statements. Deterministic
 * (mulberry32), so the demo is identical on every reload, yet dense and varied
 * enough to feel alive. The set-pieces (a signature "aha", a wheel-spin abandon)
 * emerge from the archetype parameters, not from hand-placed rows.
 */
import type { Statement, Verb } from './events';
import { CONCEPT_BY_ID, COURSES, DAY_S, NOW, SPAN_DAYS, START, VIDEOS_OF, type Concept, type TopicSlug, type Video } from './catalog';

// ---------------- archetypes ----------------
interface Params {
  diligence: number; // finishes videos, few abandons
  rewatch: number; // seeks back on hard parts (productive)
  speed: number; // skims / speeds up
  consistency: number; // studies most days vs cramming
  accuracy: number; // base quiz correctness
  impulsive: number; // fast-wrong slips
  helpSeeking: number; // hint usage
  nightOwl: number; // 0 = daytime, 1 = late night
  persistence: number; // struggles productively vs gives up
}

export interface Learner {
  id: string;
  name: string;
  tagline: string;
  joinedLabel: string;
  focus: TopicSlug[];
  params: Params;
}

export const LEARNERS: Learner[] = [
  {
    id: 'hieu',
    name: 'Lê Trung Hiếu',
    tagline: 'Học đều, tiến bộ rõ — hay vượt qua chỗ khó bằng cách xem lại kỹ',
    joinedLabel: 'Tham gia gần 1 năm trước',
    focus: ['ai', 'data', 'pm', 'web', 'english'],
    params: { diligence: 0.82, rewatch: 0.78, speed: 0.35, consistency: 0.72, accuracy: 0.7, impulsive: 0.22, helpSeeking: 0.55, nightOwl: 0.7, persistence: 0.8 },
  },
  {
    id: 'minhanh',
    name: 'Nguyễn Minh Anh',
    tagline: 'Cần mẫn, xem kỹ từng bài — chuỗi ngày học dài, ít bỏ dở',
    joinedLabel: 'Tham gia 6 tuần trước',
    focus: ['english', 'pm', 'data'],
    params: { diligence: 0.92, rewatch: 0.7, speed: 0.25, consistency: 0.88, accuracy: 0.78, impulsive: 0.12, helpSeeking: 0.4, nightOwl: 0.3, persistence: 0.85 },
  },
  {
    id: 'baonam',
    name: 'Trần Bảo Nam',
    tagline: 'Lướt nhanh, hay bỏ dở ở phần khó — cần được kéo lại',
    joinedLabel: 'Tham gia 5 tuần trước',
    focus: ['web', 'ai'],
    params: { diligence: 0.42, rewatch: 0.3, speed: 0.8, consistency: 0.4, accuracy: 0.52, impulsive: 0.5, helpSeeking: 0.3, nightOwl: 0.85, persistence: 0.32 },
  },
  {
    id: 'thuha',
    name: 'Phạm Thu Hà',
    tagline: 'Nhanh nhẹn nhưng hay chủ quan — nhiều lỗi do vội',
    joinedLabel: 'Tham gia 6 tuần trước',
    focus: ['data', 'english'],
    params: { diligence: 0.7, rewatch: 0.45, speed: 0.55, consistency: 0.66, accuracy: 0.62, impulsive: 0.78, helpSeeking: 0.35, nightOwl: 0.4, persistence: 0.55 },
  },
  {
    id: 'giahuy',
    name: 'Đỗ Gia Huy',
    tagline: 'Học dồn cuối tuần, khuya muộn — bùng nổ rồi lại nghỉ dài',
    joinedLabel: 'Tham gia 6 tuần trước',
    focus: ['ai', 'web'],
    params: { diligence: 0.6, rewatch: 0.5, speed: 0.6, consistency: 0.32, accuracy: 0.6, impulsive: 0.4, helpSeeking: 0.6, nightOwl: 0.95, persistence: 0.6 },
  },
];

export const LEARNER_BY_ID: Record<string, Learner> = Object.fromEntries(LEARNERS.map((l) => [l.id, l]));

// ---------------- PRNG ----------------
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---------------- generation context ----------------
interface Ctx {
  rnd: () => number;
  learner: Learner;
  out: Statement[];
  id: number;
  t: number;
  sessionId: string;
}

function emit(ctx: Ctx, verb: Verb, o: Partial<Statement> & { objectType: Statement['objectType']; objectId: string; courseId: string; concept: string | null }): void {
  ctx.out.push({ id: ctx.id++, t: Math.round(ctx.t), learner: ctx.learner.id, verb, sessionId: ctx.sessionId, ...o });
}

const jitter = (rnd: () => number, base: number, spread: number) => base + (rnd() - 0.5) * 2 * spread;

/** Simulate watching one video; append events and return struggle signal. */
function watchVideo(ctx: Ctx, video: Video, concept: Concept, isRevisit: boolean): { completed: boolean; rewinds: number; struggle: number; ahaPos: number | null } {
  const p = ctx.learner.params;
  const dur = video.durationS;
  const rnd = ctx.rnd;

  // playback rate — skimmers speed up, careful learners slow down on hard bits
  let rate = 1;
  if (p.speed > 0.6 && rnd() < p.speed) rate = rnd() < 0.5 ? 1.5 : 1.25;
  emit(ctx, 'played', { objectType: 'video', objectId: video.id, courseId: video.courseId, concept: concept.id, videoPos: 0, rate });
  if (rate !== 1) emit(ctx, 'ratechanged', { objectType: 'video', objectId: video.id, courseId: video.courseId, concept: concept.id, videoPos: 2, rate });

  // hotspots — where the hard bits sit
  const nHot = 1 + Math.round(concept.difficulty * 2 + rnd());
  const hotspots = Array.from({ length: nHot }, (_, i) => {
    const base = 0.2 + (0.62 * (i + 0.5)) / nHot;
    return Math.min(0.94, Math.max(0.12, jitter(rnd, base, 0.08)));
  });

  let rewinds = 0;
  let struggle = 0;
  let ahaPos: number | null = null;

  // occasional drift away from the screen
  if (rnd() < 0.5 - p.diligence * 0.3) {
    const pos = rnd() * dur * 0.5;
    ctx.t += 1;
    emit(ctx, 'blurred', { objectType: 'video', objectId: video.id, courseId: video.courseId, concept: concept.id, videoPos: Math.round(pos), durationS: Math.round(8 + rnd() * 40) });
    emit(ctx, 'focused', { objectType: 'video', objectId: video.id, courseId: video.courseId, concept: concept.id, videoPos: Math.round(pos) });
  }

  let pos = 0;
  for (let i = 0; i < hotspots.length; i++) {
    const hp = hotspots[i] * dur;
    // advance real time to the hotspot
    ctx.t += (hp - pos) / rate + 1;
    pos = hp;
    const hardness = concept.difficulty * (0.6 + 0.6 * rnd());
    const engages = rnd() < p.rewatch * (0.6 + hardness);
    if (engages) {
      emit(ctx, 'paused', { objectType: 'video', objectId: video.id, courseId: video.courseId, concept: concept.id, videoPos: Math.round(hp), durationS: Math.round(3 + rnd() * 12) });
      ctx.t += 3 + rnd() * 10;
      // rewind to re-hear the hard bit
      const nRew = 1 + Math.round(hardness * 2 * p.rewatch);
      for (let r = 0; r < nRew; r++) {
        const back = Math.min(hp, (0.04 + rnd() * 0.08) * dur);
        emit(ctx, 'seeked', { objectType: 'video', objectId: video.id, courseId: video.courseId, concept: concept.id, videoPos: Math.round(hp), from: Math.round(hp), to: Math.round(hp - back), dir: 'back' });
        rewinds++;
        struggle += 1;
        ctx.t += back / rate + 2;
      }
      if (rnd() < p.speed * 0.4) emit(ctx, 'ratechanged', { objectType: 'video', objectId: video.id, courseId: video.courseId, concept: concept.id, videoPos: Math.round(hp), rate: 0.75 });
      if (rnd() < p.helpSeeking * (0.4 + hardness)) {
        emit(ctx, 'hinted', { objectType: 'video', objectId: video.id, courseId: video.courseId, concept: concept.id, videoPos: Math.round(hp) });
        struggle += 0.6;
      }
    } else if (p.speed > 0.6 && rnd() < p.speed - 0.3) {
      // skimmer jumps forward, skipping the hard bit
      const fwd = (0.05 + rnd() * 0.12) * dur;
      emit(ctx, 'seeked', { objectType: 'video', objectId: video.id, courseId: video.courseId, concept: concept.id, videoPos: Math.round(hp), from: Math.round(hp), to: Math.round(Math.min(dur, hp + fwd)), dir: 'fwd' });
      pos = Math.min(dur, hp + fwd);
    }

    // give-up check right at the hard bit
    const abandonP = (1 - p.persistence) * (0.35 + hardness * 0.5) * (isRevisit ? 0.4 : 1);
    if (i >= hotspots.length - 1 && rnd() < abandonP && pos < dur * 0.9) {
      emit(ctx, 'abandoned', { objectType: 'video', objectId: video.id, courseId: video.courseId, concept: concept.id, videoPos: Math.round(pos) });
      return { completed: false, rewinds, struggle, ahaPos: null };
    }
  }

  // reach the end
  ctx.t += (dur - pos) / rate + 1;
  emit(ctx, 'completed', { objectType: 'video', objectId: video.id, courseId: video.courseId, concept: concept.id, videoPos: dur });
  // an "aha" is: real struggle, then pushed through to the end
  if (rewinds >= 2 && struggle >= 2 && rnd() < 0.55 + p.persistence * 0.4) {
    ahaPos = hotspots[hotspots.length - 1] * dur;
  }
  return { completed: true, rewinds, struggle, ahaPos };
}

/** One or more quiz attempts on a concept, coloured by whether they struggled. */
function doQuiz(ctx: Ctx, concept: Concept, struggle: number, completed: boolean): { correct: boolean } {
  const p = ctx.learner.params;
  const rnd = ctx.rnd;
  ctx.t += 3 + rnd() * 6;
  // learners get better over the year — accuracy drifts up with experience
  const prog = Math.min(1, Math.max(0, ctx.t / DAY_S / SPAN_DAYS));
  let base = p.accuracy - 0.12 + prog * 0.24 - concept.difficulty * 0.4 + (struggle >= 2 ? 0.16 : 0) + (completed ? 0.05 : -0.15);
  base = Math.max(0.08, Math.min(0.95, base));
  const attempts = 1 + (rnd() < 0.3 ? 1 : 0);
  let correct = false;
  for (let a = 0; a < attempts && !correct; a++) {
    const impulsiveNow = rnd() < p.impulsive;
    correct = rnd() < base + a * 0.15;
    // slips: fast + wrong; gaps: slow + wrong; fluent: fast + right; effortful: slow + right
    let latencyMs: number;
    if (impulsiveNow) latencyMs = Math.round(1500 + rnd() * 3500);
    else latencyMs = Math.round(8000 + concept.difficulty * 22000 + rnd() * 9000);
    if (impulsiveNow && correct && rnd() < 0.5) correct = false; // vội nên trượt
    emit(ctx, 'answered', { objectType: 'quiz', objectId: `q:${concept.id}`, courseId: concept.courseId, concept: concept.id, correct, latencyMs });
    ctx.t += latencyMs / 1000 + 2;
  }
  return { correct };
}

/** Build the learner's ordered path through their focus courses. */
function buildPlaylist(learner: Learner): { video: Video; concept: Concept }[] {
  const courses = learner.focus.flatMap((topic) => VIDEOS_OF_TOPIC(topic));
  return courses.map((v) => ({ video: v, concept: CONCEPT_BY_ID[v.concept] }));
}
function VIDEOS_OF_TOPIC(topic: TopicSlug): Video[] {
  // courses in this topic, in catalogue order, videos in order
  const out: Video[] = [];
  for (const c of COURSES_OF_TOPIC(topic)) out.push(...VIDEOS_OF(c));
  return out;
}
function COURSES_OF_TOPIC(topic: TopicSlug): string[] {
  return COURSES.filter((c) => c.topic === topic).map((c) => c.id);
}

/** hour of day for a session, from the night-owl parameter. */
function pickHour(rnd: () => number, nightOwl: number): number {
  if (rnd() < nightOwl) return 20 + Math.floor(rnd() * 4); // 20–23h
  if (rnd() < 0.5) return 12 + Math.floor(rnd() * 3); // 12–14h
  return 8 + Math.floor(rnd() * 3); // 8–10h
}

function generate(learner: Learner): Statement[] {
  const rnd = mulberry32(hashStr(learner.id) ^ 0x9e3779b9);
  const ctx: Ctx = { rnd, learner, out: [], id: 0, t: 0, sessionId: '' };
  const playlist = buildPlaylist(learner);
  let cursor = 0;
  const done: { concept: Concept; correct: boolean; struggle: number; lastDay: number }[] = [];
  const p = learner.params;

  for (let day = 0; day <= SPAN_DAYS; day++) {
    const date = new Date(NOW.getTime() - (SPAN_DAYS - day) * DAY_S * 1000);
    const dow = date.getDay();
    const weekend = dow === 0 || dow === 6;
    // ramp engagement up over the weeks (a learner warming up)
    const ramp = 0.55 + 0.45 * (day / SPAN_DAYS);
    let pStudy = p.consistency * ramp;
    if (p.consistency < 0.5) pStudy = weekend ? 0.85 * ramp : 0.22 * ramp; // crammer
    if (rnd() > pStudy) continue;

    const lastDay = day === SPAN_DAYS;
    const nSessions = lastDay ? 1 : rnd() < 0.2 + (weekend ? 0.2 : 0) ? 2 : 1;
    const midnightT = (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - START.getTime()) / 1000;
    for (let s = 0; s < nSessions; s++) {
      if (s === 0) {
        let hr = pickHour(rnd, p.nightOwl);
        if (lastDay) hr = Math.min(hr, 12 + Math.floor(rnd() * 3)); // giữ buổi học ngày cuối trước "bây giờ" (20:30)
        ctx.t = midnightT + hr * 3600 + Math.floor(rnd() * 40) * 60;
      } else {
        ctx.t += (30 + Math.floor(rnd() * 90)) * 60; // buổi sau bắt đầu sau khi buổi trước kết thúc
      }
      ctx.sessionId = `${learner.id}-d${day}-s${s}`;
      const items = 1 + Math.round(rnd() * 2 + (weekend ? 1 : 0));
      for (let k = 0; k < items; k++) {
        // decide: push on with new material, or review something already seen
        const playlistLeft = cursor < playlist.length;
        const shaky = done.filter((d) => !d.correct);
        // once the new material runs out, days are filled with spaced review
        const wantReview = !playlistLeft || (shaky.length > 0 && rnd() < p.rewatch * 0.5) || (done.length > 3 && rnd() < 0.22);
        let video: Video;
        let concept: Concept;
        let isRevisit = false;
        if (wantReview && done.length > 0) {
          const pool = shaky.length > 0 && rnd() < 0.6 ? shaky : done;
          const pick = pool[Math.floor(rnd() * pool.length)];
          concept = pick.concept;
          video = VIDEOS_OF(concept.courseId).find((v) => v.concept === concept.id)!;
          isRevisit = true;
          emit(ctx, 'revisited', { objectType: 'video', objectId: video.id, courseId: video.courseId, concept: concept.id, videoPos: 0 });
        } else if (playlistLeft) {
          ({ video, concept } = playlist[cursor++]);
        } else break;

        const w = watchVideo(ctx, video, concept, isRevisit);
        if (w.completed || w.rewinds > 0) {
          const q = doQuiz(ctx, concept, w.struggle, w.completed);
          const rec = done.find((d) => d.concept.id === concept.id);
          if (rec) {
            rec.correct = rec.correct || q.correct;
            rec.lastDay = day;
          } else {
            done.push({ concept, correct: q.correct, struggle: w.struggle, lastDay: day });
          }
        }
        // short break between items
        ctx.t += 60 + rnd() * 240;
        if (rnd() < 0.3) {
          emit(ctx, 'idled', { objectType: 'video', objectId: video.id, courseId: video.courseId, concept: concept.id, durationS: Math.round(40 + rnd() * 180) });
        }
      }
    }
  }
  return ctx.out.sort((a, b) => a.t - b.t);
}

// ---------------- public bundle ----------------
export interface BehaviorData {
  learner: Learner;
  statements: Statement[];
  courseIds: string[];
  conceptIds: string[];
  videoIds: string[];
}

const cache = new Map<string, BehaviorData>();

export function getBehaviorData(learnerId: string): BehaviorData {
  const cached = cache.get(learnerId);
  if (cached) return cached;
  const learner = LEARNER_BY_ID[learnerId] ?? LEARNERS[0];
  const statements = generate(learner);
  const courseIds = [...new Set(statements.map((s) => s.courseId))];
  const conceptIds = [...new Set(statements.map((s) => s.concept).filter((c): c is string => !!c))];
  const videoIds = [...new Set(statements.filter((s) => s.objectType === 'video').map((s) => s.objectId))];
  const data: BehaviorData = { learner, statements, courseIds, conceptIds, videoIds };
  cache.set(learnerId, data);
  return data;
}
