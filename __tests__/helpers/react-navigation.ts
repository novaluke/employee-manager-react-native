import { NavigationDispatch, NavigationScreenProp } from "react-navigation";

export const stubNavigation: () => NavigationScreenProp<any> = () => ({
  addListener: jest.fn(),
  closeDrawer: jest.fn(),
  dismiss: jest.fn(),
  dispatch: jest.fn<NavigationDispatch>(),
  getParam: jest.fn(),
  goBack: jest.fn(),
  isFocused: jest.fn(),
  navigate: jest.fn(),
  openDrawer: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  setParams: jest.fn(),
  state: {},
  toggleDrawer: jest.fn(),
});
