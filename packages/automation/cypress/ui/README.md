# ViewPoint E2E Automation tests

The tests in this directory are UI functional tests. To run them, the only requirement is that the ViewPoint Client be
accessible via browser (either running as a dev server, or hosted by the ViewPoint server).

Since these tests do not require the full IVLS suite of services, it is required that any network requests that are
needed for the functionality being tested as intercepted and mocked out.

## Running

To run the tests, use the `ui` suite command:

```
npm run cypress:ui
```
