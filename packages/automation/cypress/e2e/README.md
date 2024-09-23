# ViewPoint E2E Automation tests

The tests in this directory are full end to end automated tests. They require that the entire application suite (IVLS,
ViewPoint Client, ViewPoint Server) plus simulated external services (IRIS, InterLink PIMS REST Server) are running and
accessible.

## Configuration

**Note:** See https://docs.cypress.io/guides/guides/environment-variables#Option-2-cypress-env-json if you'd like to keep
your local environment variables centralized

### IVLS

IVLS must be accessible by the test suite. If IVLS is running on the same machine as the tests, no configuration is required
and the target will be set as `127.0.0.1:50042`

If IVLS is not on the same machine, use the `IVLS_TARGET` environment variable to specify the host and port the IVLS can be accessed at:

```
export IVLS_TARGET=192.168.222.5:50042
```

### IRIS (Instrument Simulator)

The instrument simulator must be accessible by the test suite. If IRIS is running on the same machine as the tests, no configuration is required
and the target will be set as `127.0.0.1:50045`

If IRIS is not on the same machine, use the `IRIS_TARGET` environment variable to specify the host and port the IVLS can be accessed at:

```
export IRIS_TARGET=192.168.222.5:50045
```

## Running

To run the tests, use the `e2e` suite command:

```
npm run cypress:e2e
```
