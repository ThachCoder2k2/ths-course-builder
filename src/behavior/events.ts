/**
 * Event model for the behaviour-driven learner analytics ("mock LRS").
 *
 * Every meaningful thing a learner does is recorded as one immutable Statement
 * (xAPI-shaped: actor → verb → object, plus a small result/context payload).
 * Every widget on the dashboard is a pure reducer over an array of these — no
 * hard-coded metric ever; the numbers are always read back out of real actions.
 */

export type Verb =
  // video
  | 'played'
  | 'paused'
  | 'seeked'
  | 'ratechanged'
  | 'completed'
  | 'abandoned'
  // practice
  | 'answered'
  | 'hinted'
  // reading / revisit
  | 'read'
  | 'revisited'
  // attention
  | 'idled'
  | 'blurred'
  | 'focused'
  // reflection
  | 'noted';

export type ObjectType = 'video' | 'quiz' | 'reading' | 'concept';

export type SeekDir = 'back' | 'fwd';

/** One recorded action. Times are absolute seconds since the seed epoch. */
export interface Statement {
  id: number;
  /** absolute time, seconds since epoch (see catalog.EPOCH) */
  t: number;
  learner: string;
  verb: Verb;
  objectType: ObjectType;
  /** id of the video / quiz / reading / concept touched */
  objectId: string;
  courseId: string;
  /** the concept this action bears on (null for pure navigation) */
  concept: string | null;
  /** which continuous study session this belongs to */
  sessionId: string;

  // ---- result / context payload (only the relevant fields are set) ----
  /** playhead position inside the video, seconds */
  videoPos?: number;
  /** seek source / target, seconds */
  from?: number;
  to?: number;
  dir?: SeekDir;
  /** playback speed after a ratechanged */
  rate?: number;
  /** quiz correctness */
  correct?: boolean;
  /** quiz answer latency, milliseconds */
  latencyMs?: number;
  /** dwell / idle length, seconds */
  durationS?: number;
}

/** Human labels for verbs (used in the raw event-stream / replay dots). */
export const VERB_LABEL: Record<Verb, string> = {
  played: 'Bật xem',
  paused: 'Tạm dừng',
  seeked: 'Tua',
  ratechanged: 'Đổi tốc độ',
  completed: 'Xem hết',
  abandoned: 'Bỏ dở',
  answered: 'Trả lời',
  hinted: 'Xin gợi ý',
  read: 'Đọc',
  revisited: 'Quay lại',
  idled: 'Ngồi im',
  blurred: 'Rời tab',
  focused: 'Quay lại tab',
  noted: 'Ghi chú',
};
