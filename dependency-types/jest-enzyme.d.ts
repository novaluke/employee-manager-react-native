/* tslint:disable:no-namespace interface-name */
declare namespace jest {
  interface ToMatchElementOptions {
    ignoreProps?: boolean;
  }
  interface Matchers<R> {
    toMatchElement(
      element: React.ReactElement<any>,
      options?: ToMatchElementOptions,
    ): void;
  }
}
