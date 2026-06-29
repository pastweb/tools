export type SSRTrackerPhase = 'collect' | 'resolve-tasks' | 'dehydrate' | 'render';

export interface SSRDependency {
  type: string;
  key?: string;
  phase?: SSRTrackerPhase;
  [prop: string]: unknown;
};

export interface SSRTrackerOptions {
  route?: string;
  phase?: SSRTrackerPhase;
};

export interface SSRTrackerSnapshot {
  isDynamic: boolean;
  reasons: string[];
  dependencies: SSRDependency[];
  phase: SSRTrackerPhase;
  route?: string;
};

export interface SSRTracker {
  readonly isDynamic: boolean;
  readonly reasons: Set<string>;
  readonly dependencies: Map<string, SSRDependency>;
  readonly phase: SSRTrackerPhase;
  readonly route?: string;
  setPhase: (phase: SSRTrackerPhase) => void;
  markDynamic: (reason: string) => void;
  addDependency: (dependency: SSRDependency) => string;
  snapshot: () => SSRTrackerSnapshot;
  reset: () => void;
};
