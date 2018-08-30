export type Async<T> =
  | { state: "INIT" }
  | { state: "PROGRESS" }
  | { state: "COMPLETE"; value: T }
  | { state: "ERROR"; error: string };
