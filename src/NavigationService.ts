import {
  NavigationActions,
  NavigationContainerComponent,
  NavigationParams,
} from "react-navigation";

export type NavigateFunction = (
  routeName: string,
  params?: NavigationParams,
) => boolean;

let rootNavigatorComponent: NavigationContainerComponent;

export function setNavigation(
  navigatorComponent: NavigationContainerComponent,
): void {
  rootNavigatorComponent = navigatorComponent;
}

export const navigate: NavigateFunction = (routeName, params) =>
  rootNavigatorComponent
    ? rootNavigatorComponent.dispatch(
        NavigationActions.navigate({
          params,
          routeName,
        }),
      )
    : false;
