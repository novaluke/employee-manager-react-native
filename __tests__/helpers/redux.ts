import { Store } from "redux";

export class StubbedStore implements Store {
  public constructor(public state: object = {}) {}

  public dispatch = jest.fn();

  public getState() {
    return this.state;
  }

  public subscribe = jest.fn();

  public replaceReducer = jest.fn();
}
