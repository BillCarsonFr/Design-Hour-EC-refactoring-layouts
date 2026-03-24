import type { TileProvider } from "./TileProvider.ts";

import type { Participant } from "../session/participant.ts";

import {
  combineLatest,
  distinctUntilChanged,
  filter,
  from,
  map,
  merge,
  mergeMap,
  Observable,
  pairwise,
  scan,
  share,
  startWith,
  takeUntil,
} from "rxjs";
import type { Session } from "../session/session.ts";
import type { TileLayoutMetaData } from "../components/layoutcontainer/TileDataInterfaces.ts";

type JoinEvent = { type: "join"; participant: Participant; joinOrder: number };
type LeaveEvent = { type: "leave"; id: string };
type ScoreEvent = { type: "score"; id: string; score: number };
type Event = JoinEvent | LeaveEvent | ScoreEvent;

type Entry = TileLayoutMetaData & {
  // Tie breakers for sorting
  lastSpokeAt: number;
  joinOrder: number;
};
type State = {
  byId: Map<string, Entry>;
  nextJoinOrder: number;
};

export class SessionTileProvider implements TileProvider {
  // Todo make this reactive
  getTiles(): TileLayoutMetaData[] {
    return [];
  }

  public tiles$ = new Observable<TileLayoutMetaData[]>();

  constructor(session: Session) {
    // 1) Snapshot diff -> join/leave deltas
    const rosterEvents$ = session.participants$.pipe(
      startWith([] as Participant[]),
      pairwise(),
      mergeMap(([prev, next]) => {
        const prevMap = new Map(prev.map((p) => [p.id, p]));
        const nextMap = new Map(next.map((p) => [p.id, p]));
        const events: Event[] = [];
        let joinOrderBase = 0;

        // joins (or replacement by new object identity -> leave+join)
        for (const [id, pNext] of nextMap) {
          const pPrev = prevMap.get(id);
          if (!pPrev) {
            events.push({
              type: "join",
              participant: pNext,
              joinOrder: joinOrderBase++,
            });
          } else if (pPrev !== pNext) {
            events.push({ type: "leave", id });
            events.push({
              type: "join",
              participant: pNext,
              joinOrder: joinOrderBase++,
            });
          }
        }

        // leaves
        for (const [id] of prevMap) {
          if (!nextMap.has(id)) events.push({ type: "leave", id });
        }

        return from(events);
      }),
      share(),
    );

    const leave$ = rosterEvents$.pipe(
      filter((e): e is LeaveEvent => e.type === "leave"),
      share(),
    );

    // 2) Per-join score stream, auto-stopped by matching leave
    const scoreEvents$ = rosterEvents$.pipe(
      filter((e): e is JoinEvent => e.type === "join"),
      mergeMap((joinEv) =>
        combineLatest([
          joinEv.participant.isSpeaking$,
          joinEv.participant.isVideoEnabled$,
        ]).pipe(
          startWith([false, false]),
          distinctUntilChanged(),
          map(
            ([isSpeaking, isVideoEnabled]): ScoreEvent => ({
              type: "score",
              id: joinEv.participant.id,
              score: isSpeaking ? 1000 : isVideoEnabled ? 100 : 0,
            }),
          ),
          takeUntil(leave$.pipe(filter((l) => l.id === joinEv.participant.id))),
        ),
      ),
    );
    // 3) Merge all events and reduce to current ordered tile list
    this.tiles$ = merge(rosterEvents$, scoreEvents$).pipe(
      scan<Event, State>(
        (state, ev) => {
          const byId = new Map(state.byId);

          if (ev.type === "join") {
            byId.set(ev.participant.id, {
              id: ev.participant.id,
              score: 0,
              lastSpokeAt: 0,
              joinOrder: state.nextJoinOrder + ev.joinOrder,
            });
            return { byId, nextJoinOrder: state.nextJoinOrder + 1 };
          }

          if (ev.type === "leave") {
            byId.delete(ev.id);
            return { byId, nextJoinOrder: state.nextJoinOrder };
          }

          // score event
          const current = byId.get(ev.id);
          if (!current) return state; // late score after leave; ignore

          const justStartedSpeaking = ev.score == 1000 && current.score < 1000;

          byId.set(ev.id, {
            ...current,
            score: ev.score,
            lastSpokeAt: justStartedSpeaking ? Date.now() : current.lastSpokeAt,
          });

          return { byId, nextJoinOrder: state.nextJoinOrder };
        },
        { byId: new Map(), nextJoinOrder: 0 },
      ),

      map((state) =>
        Array.from(state.byId.values())
          .sort(
            (a, b) =>
              b.score - a.score ||
              b.lastSpokeAt - a.lastSpokeAt ||
              a.joinOrder - b.joinOrder,
          )
          .map(({ id, score }) => ({ id, score })),
      ),

      distinctUntilChanged(
        (a, b) =>
          a.length === b.length &&
          a.every((x, i) => x.id === b[i].id && x.score === b[i].score),
      ),
    );
  }
}
