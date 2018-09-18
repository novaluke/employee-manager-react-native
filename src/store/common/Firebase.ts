import firebase from "firebase";
import { Observable, Observer, TeardownLogic } from "rxjs";

export type OnEventType =
  | "value"
  | "child_added"
  | "child_removed"
  | "child_changed";

export function firebaseOn(
  refPath: string,
  eventType: OnEventType = "value",
): Observable<any> {
  const ref = firebase.database().ref(refPath);
  return Observable.create(
    (observer: Observer<any>): TeardownLogic => {
      const handler = (x: firebase.database.DataSnapshot) =>
        observer.next(x.val());
      ref.on(eventType, handler);
      return () => ref.off(eventType, handler);
    },
  );
}

export function firebasePush(
  refPath: string,
  payload: any,
): Observable<firebase.database.Reference> {
  return Observable.create(
    (observer: Observer<firebase.database.Reference>): TeardownLogic => {
      firebase
        .database()
        .ref(refPath)
        .push(payload)
        // Can't pass the observer functions directly or else they throw errors
        // for some reason
        .then(
          (x: firebase.database.Reference) => observer.next(x),
          e => observer.error(e),
        )
        .then(() => observer.complete());
    },
  );
}

export function firebaseSet(refPath: string, payload: any): Observable<void> {
  return Observable.create(
    (observer: Observer<void>): TeardownLogic => {
      firebase
        .database()
        .ref(refPath)
        .set(payload)
        // Can't pass the observer functions directly or else they throw errors
        // for some reason
        .then(x => observer.next(x), e => observer.error(e))
        .then(() => observer.complete());
    },
  );
}

export function firebaseRemove(refPath: string): Observable<void> {
  return Observable.create(
    (observer: Observer<void>): TeardownLogic => {
      firebase
        .database()
        .ref(refPath)
        .remove()
        // Can't pass the observer functions directly or else they throw errors
        // for some reason
        .then(x => observer.next(x), e => observer.error(e))
        .then(() => observer.complete());
    },
  );
}
