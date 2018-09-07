import * as firebaseOrig from "firebase";

/* tslint:disable:no-namespace interface-name */
declare module "firebase" {
  namespace database {
    interface Query {
      on(
        eventType: string,
        callback: (a: firebaseOrig.database.DataSnapshot, b?: string) => any,
        cancelCallbackOrContext?: object | null,
        context?: object | null,
      ): (a: firebaseOrig.database.DataSnapshot, b?: string) => any;
    }
  }
}
