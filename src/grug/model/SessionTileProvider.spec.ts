import { it, expect, describe, beforeEach } from "vitest";

import { SessionTileProvider } from "./SessionTileProvider";
import { Participant } from "../session/participant.ts";
import { BehaviorSubject, tap } from "rxjs";
import type { Session } from "../session/session.ts";
import { TestScheduler } from "rxjs/testing";
import type { TileLayoutMetaData } from "../components/layoutcontainer/TileDataInterfaces.ts";

describe("SessionTileProvider", () => {
  let scheduler: TestScheduler;
  let mockSession: Session;
  let provider: SessionTileProvider;

  beforeEach(() => {
    scheduler = new TestScheduler(() => {
      // We do assertions manually below
    });

    const participants$ = new BehaviorSubject<Participant[]>([]);
    mockSession = {
      participants$: participants$,
    } as unknown as Session;
    provider = new SessionTileProvider(mockSession);
  });

  it("Initial ordering", async () => {
    scheduler.run(({ flush }) => {
      const alice = new Participant("0", "alice");
      const bob = new Participant("1", "bob");
      const carl = new Participant("2", "carl");

      // Initial state
      bob.isSpeaking$.next(true);
      carl.isVideoEnabled$.next(true);

      const emissions: TileLayoutMetaData[][] = [];
      provider.tiles$
        .pipe(tap(console.log))
        .subscribe((tiles) => emissions.push(tiles));

      scheduler.schedule(() => {
        mockSession.participants$.next([alice, bob, carl]);
      });

      flush();

      const currentState = emissions.pop();
      expect(currentState).toBeDefined();
      expect(currentState?.length).toBe(3);
      expect(currentState?.[0]?.id).toBe("1");
      expect(currentState?.[1]?.id).toBe("2");
      expect(currentState?.[2]?.id).toBe("0");
    });
  });

  it("The active speaker should be on the top", async () => {
    scheduler.run(({ flush }) => {
      const alice = new Participant("0", "alice");
      const bob = new Participant("1", "bob");
      const carl = new Participant("2", "carl");

      const emissions: TileLayoutMetaData[][] = [];
      provider.tiles$
        .pipe(tap(console.log))
        .subscribe((tiles) => emissions.push(tiles));

      scheduler.schedule(() => {
        mockSession.participants$.next([alice, bob, carl]);
      });

      // carl starts speaking
      carl.isSpeaking$.next(true);

      flush();

      expect(emissions.pop()?.[0]?.id).toBe(carl.id);

      // bob starts speaking
      bob.isSpeaking$.next(true);
      carl.isSpeaking$.next(false);

      flush();
      expect(emissions.pop()?.[0]?.id).toBe(bob.id);

      // Alice starts speaking
      alice.isSpeaking$.next(true);
      bob.isSpeaking$.next(false);

      flush();
      expect(emissions.pop()?.[0]?.id).toBe(alice.id);
    });
  });
});
