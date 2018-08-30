This is a basic exploration of React Native with Redux and TypeScript. Currently
only Android is supported.

### Usage

Clone the project and run `yarn` to pull in the dependencies.

`yarn lint` runs files through `eslint`, `tslint`, `tsc`, and `prettier` for
thorough linting and type-checking.

`yarn test` executes the Jest test suite, and can be used with `--watch` to
re-run relevant tests when files are changed.

To use the app on an Android emulator or device, [install the React Native build
tools](https://facebook.github.io/react-native/docs/getting-started.html)
(follow instructions for "Building Projects with Native Code") and run
`react-native run-android`. This will:

1. Compile the app.
2. Load the app onto the device/virtual device.
3. Get the device to run the app.
4. Run a server to recompile the app whenever files are changed (as well as push
   those changes to the app, if the appropriate setting in the app is enabled).

### Credentials

This app uses firebase as a backend, so it needs to be provided with credentials
for firebase. The app will look for the credentials in
`/path/to/project/firebaseConfig.json`.
