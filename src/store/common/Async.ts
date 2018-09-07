export type ActionType<L, R> =
  | { tag: ActionTypeTag.Start }
  | { tag: ActionTypeTag.Success; r: R }
  | { tag: ActionTypeTag.Failure; l: L };

export enum ActionTypeTag {
  Start,
  Success,
  Failure,
}

export interface ICaseHandlers<L, R, S, X> {
  start: (mixin: Partial<S>) => X;
  success: (r: R, mixin: Partial<S>) => X;
  failure: (l: L, mixin: Partial<S>) => X;
}

export class Action<L, R, S> {
  // Helper functions for less verbose creation
  public static start<L, R, S>(mixin?: Partial<S>) {
    return new Action<L, R, S>({ tag: ActionTypeTag.Start }, mixin);
  }

  public static success<L, R, S>(r: R, mixin?: Partial<S>) {
    return new Action<L, R, S>({ r, tag: ActionTypeTag.Success }, mixin);
  }

  public static failure<L, R, S>(l: L, mixin?: Partial<S>) {
    return new Action<L, R, S>({ l, tag: ActionTypeTag.Failure }, mixin);
  }

  /* eslint-disable no-useless-constructor, no-empty-function */
  private constructor(
    private actionType: ActionType<L, R>,
    private stateMixin: Partial<S> = {},
  ) {}
  /* eslint-enable */

  public start(callback: () => Partial<S>): Action<L, R, S> {
    const type = this.actionType;
    if (type.tag === ActionTypeTag.Start) {
      const stateMixin = callback();
      return new Action(type, Object.assign({}, this.stateMixin, stateMixin));
    }
    return this;
  }

  public success<T>(callback: (r: R) => [T, Partial<S>]): Action<L, T, S> {
    const type = this.actionType;
    if (type.tag === ActionTypeTag.Success) {
      const [data, stateMixin] = callback(type.r);
      const newType = { ...type, r: data };
      return new Action(
        newType,
        Object.assign({}, this.stateMixin, stateMixin),
      );
    }
    return new Action(type, this.stateMixin);
  }

  public failure<T>(callback: (l: L) => [T, Partial<S>]): Action<T, R, S> {
    const type = this.actionType;
    if (type.tag === ActionTypeTag.Failure) {
      const [data, stateMixin] = callback(type.l);
      const newType = { ...type, l: data };
      return new Action(
        newType,
        Object.assign({}, this.stateMixin, stateMixin),
      );
    }
    return new Action(type, this.stateMixin);
  }

  /* eslint-disable-next-line consistent-return */
  public caseOf<T>(handlers: ICaseHandlers<L, R, S, T>) {
    const type = this.actionType;
    /* eslint-disable-next-line default-case */
    switch (type.tag) {
      case ActionTypeTag.Start:
        return handlers.start(this.stateMixin);
      case ActionTypeTag.Success:
        return handlers.success(type.r, this.stateMixin);
      case ActionTypeTag.Failure:
        return handlers.failure(type.l, this.stateMixin);
    }
  }
}

// TODO consider using an Either-style construct here as well, or whether that
// would introduce more complexity in trying to pattern match on it in the view
// code than it would solve
export type AsyncValue<T> =
  | { state: "INIT" }
  | { state: "PROGRESS" }
  | { state: "COMPLETE"; value: T }
  | { state: "ERROR"; error: string };

export function asyncReducer<S, R>(
  state: S,
  asyncCreator: (asyncValue: AsyncValue<R>) => Partial<S>,
  action: Action<string, R, S>,
): S {
  const mix = (asyncValue: AsyncValue<R>, mixin: Partial<S>) =>
    Object.assign({}, state, asyncCreator(asyncValue), mixin);

  return action.caseOf({
    failure: (error, mixin) => mix({ error, state: "ERROR" }, mixin),
    start: mixin => mix({ state: "PROGRESS" }, mixin),
    success: (value, mixin) => mix({ value, state: "COMPLETE" }, mixin),
  });
}
