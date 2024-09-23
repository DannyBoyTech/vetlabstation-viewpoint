# Viewpoint

---

## Getting Started

> **Note**: If you're using a Windows system and you'd like to use WSL (for working in a \*nix shell environment), see the "Windows Users" section below before installing anything, as the tools used must be installed into the WSL environment

### Install Node and NPM

Make sure you have [Node](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/) >= 18 installed

The current versions used in the build processes are Node lts/hydrogen (18.x) and NPM 10.2.3. The Node version is determined
by the version of Node included in the version of Electron we are using.

A useful tool for managing Node and NPM installations is [nvm](https://github.com/creationix/nvm)

The version recommendations below follow the best practice of matching your local environment to CI/Build environments.

#### Node Version

It's recommended that you use the Node version matching the one used by Electron to run Viewpoint. Check [packages/app/package.json](packages/app/package.json) to see the projects current Electron version.

To then see the Node version corresponding to the current version of Electron, refer to: [Electron Timelines](https://www.electronjs.org/docs/latest/tutorial/electron-timelines)

> **Note**: Node versions 18+ may cause issues running the UI tests. See [related GitHub Issue](https://github.com/mswjs/msw/issues/1388)

#### NPM Version

It's recommended that you match the version specified in the [.github/workflows/build.yml](.github/workflows/build.yml).

### Configure NPM

Configure NPM to retrieve `@idexx` scoped NPM packages from [GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).
This will allow retrieving the SPOT NPM dependencies.

- Create a `Classic` GitHub token with scope `read:packages`
  - Make sure you copy the token when it appears on screen as you can't get it back once you leave the page
- Authorize the token with IDEXX SSO
  - From the token page, choose `Configure SSO` next to the token you just created
  - Select `IDEXX` from the dropdown and log in through SSO if necessary
- Create or update the `.npmrc` file in your home directory (`~/.npmrc`) with the following content:
  ```
  @idexx:registry=https://npm.pkg.github.com
  //npm.pkg.github.com/:_authToken=<YOUR_GITHUB_TOKEN>
  ```

---

### VP Server and VP UI on same host as IVLS

If the IVLS, Viewpoint Server and Viewpoint UI are all running on the same host, no additional
configuration is required

---

### VP Server and VP UI not on the same host as IVLS

If the IVLS is on a different host from both the Viewpoint Server and the Viewpoint UI, there are two options for development:

#### SSH Port Forwarding

SSH Port forwarding can be used to access the IVLS ports as though they were on `localhost`. Once this is configured,
no additional environment changes are needed:

```
ssh -N -L 50042:localhost:50042 -L 5672:localhost:5672 "$IVLS_USERNAME@$IVLS_HOST"
```

#### Environment configuration:

If port forwarding is not an option, environment variables are used in the Viewpoint Server to configure the IVLS host.

However, the default username/password for RabbitMQ only works on `localhost`. If the Viewpoint backend needs to
access the broker from a different host, you must first [Create a new user](https://www.rabbitmq.com/access-control.html#user-management).

Once a new user has been created for RabbitMQ, use the following environment variables to configure the server:

- `UPSTREAM_REQ_URL`: The full URL of the IVLS API (eg. `http://192.168.222.5:50042`)
- `BROKER_URL`: The full URL of the RabbitMQ broker on the IVLS system (eg. `amqp://192.168.222.5`)
- `AMQP_USERNAME`: The new username created for RabbitMQ
- `AMQP_PASSWORD`: The new password created for RabbitMQ

The Viewpoint Server also uses [dotenv](https://github.com/motdotla/dotenv) to allow you to provide a `.env` file. An example:

```yaml
UPSTREAM_HOST=192.168.222.5 # Not used in the server - only used here so that it can be specified once and reused

UPSTREAM_REQ_URL=http://${UPSTREAM_HOST}:${UPSTREAM_PORT:-50042}
BROKER_URL=amqp://${UPSTREAM_HOST}
AMQP_USERNAME=testing
AMQP_PASSWORD=testing
```

---

### VP UI not on the same host as IVLS and VP Server

If the IVLS and Viewpoint server are on a different host than the Viewpoint UI, specify the hostname for the UI
by creating a `.env.local` file in the root of the `viewpoint` folder:

```
echo VITE_IVLS_HOST=[IVLS_IP] > packages/viewpoint/.env.local
```

---

## Running Viewpoint

After cloning the repository and configuring your environment, install the root and all subprojects by running

```
npm install --workspaces --include-workspace-root
```

Start the Viewpoint adapter server by running

```
npm run dev --workspace @viewpoint/server
```

Start the UI application by running

```
npm run dev --workspace @viewpoint/ui
```

Alternately, start the Viewpoint adapter server, UI application, and Storybook by running

```
npm run dev
```

There are also a few helper scripts in the parent project:

- `npm run server`: Launches the VP server (alias to `dev` script in `viewpoint-server` package)
- `npm run ui`: Launches the VP UI dev server (alias to `dev` in `viewpoint` package)
- `npm run ui -- -- --host`: Launches the VP UI dev server - use this command when running Cypress and VP on same host
- `npm run app`: Builds both the server and UI, then launches the Electron app in dev mode (no hot-reloading support for UI/backend code)
- `npm run app:dev`: Builds both the server and UI, then launches the Electron app in dev mode with hot-reloading support for the UI (note that the UI must be running separately and on port 5173)
- `npm run build`: Builds the entire ViewPoint distributable

---

## Project Structure

This project uses [NPM workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) to manage packages. By default,
all NPM projects within the `packages` directory will be considered a subproject of the `viewpoint-parent` project.

To run a command within the context of a specific package (for example, `@viewpoint/spot-react`), use the `--workspace`
flag:

```
npm install axios@latest --workspace @viewpoint/spot-react

// installs the latest axios library as a dependency within the @viewpoint/spot-react sub-project
```

To run a command within the context of all packages, use the `--workspaces` flag:

```
npm install --workspaces

// Installs dependencies for all sub projects (everything within the packages folder)
```

To also install dependencies for the parent project, use `--include-workspace-root` flag:

```
npm install --workspaces --include-workspace-root

// Installs dependencies for all sub projects as well as the parent project
```

See the [NPM workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) documentation for more details

---

## Storybook

To launch storybook and view the various components, run

### `npm run storybook`

---

## Unit/Component Tests

Viewpoint uses [vitest](https://vitest.dev/) along with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
for unit and component testing

To run the tests once:

```
npm run test --workspace @viewpoint/ui
```

To run them in watch mode (which will automatically re-run tests when files are changed):

```
npm run test:watch --workspace @viewpoint/ui
```

---

## E2E tests

The Viewpoint project uses [Cypress](https://cypress.io) for automated E2E testing.

### Running the tests

To run the automated UI tests in headless mode, run the following:

```
npm run dev --workspace @viewpoint/server  // start the Viewpoint Server adapter, only needed if the server is not currently running locally
npm run dev --workspace @viewpoint/ui   // start the Viewpoint UI dev server, only needed if the UI is not currently running locally
npm run ui -- -- --host   // start Viewpoint UI dev server, to be used if running Cypress and Viewpoint on same host
npm run cypress:ui --workspace @viewpoint/automation   // run the automated UI tests
npm run cypress:e2e --workspace @viewpoint/automation   // run the automated E2E tests (Note: This requires the VP Server to be running against a real IVLS)
```

### While developing

Cypress provides an integrated development experience for running automated testing while building the application.

To launch Cypress, run the following command from the parent directory (ensure you have the Viewpoint dev server running):

```
npm run dev --workspace @viewpoint/server  // start the Viewpoint Server adapter, only needed if the server is not currently running locally
npm run dev --workspace @viewpoint/ui   // start the Viewpoint UI dev server, only needed if the app is not currently running locally
npm run ui -- -- --host   // start Viewpoint UI dev server, to be used if running Cypress and Viewpoint on same host
npm run cypress:open --workspace @viewpoint/automation   // open the Cypress app
```

### Building

The ViewPoint application is bundled as an [Electron](https://www.electronjs.org/) application. Currently, the only
architecture built and supported is Windows 32-bit, although it should also be able to be built
and run on any platform supported by Electron.

To build the distributable, run the following command from the parent:

```
viewpoint % npm run build
```

This command will first build the UI and server packages. It will then use [Electron Forge](https://www.electronforge.io/) to
bundle both the UI and server packages, as well as the Electron binary.

Build artifact will go to `/packages/app/out` folder. It will contain both the packaged app (under the `viewpoint-app-win32-ia32`) folder,
as well as a zip file containing the packaged app (under the `make/zip/win32/ia32` folder)

### Windows Users: Windows Subsystem for Linux

The Viewpoint projects use NPM scripts to facilitate the build and deploy process, and these scripts are generally meant to be run in a Unix/Linux environment. They will encounter syntax errors in a Windows shell. Windows Subsystem for Linux (WSL) is a tool that will allow you to run a Linux shell and filesystem within Windows. You may want to use the WSL shell outside of your IDE to run the scripts, or integrate the WSL shell into your IDE. Using WSL will require some installation steps on this list to occur in the Linux subsystem rather than Windows (item b).

- Here are some resources for getting WSL set up:
  - [What is WSL?](https://docs.microsoft.com/en-us/windows/wsl/about)
  - [Install WSL](https://docs.microsoft.com/en-us/windows/wsl/install) (follow these instructions)
  - [FAQ](https://docs.microsoft.com/en-us/windows/wsl/faq) (includes instructions for accessing existing Windows files through WSL)
  - [Intellij WSL integration](https://www.jetbrains.com/help/idea/how-to-use-wsl-development-environment-in-product.html)
  - [VSCode WSL integration](https://code.visualstudio.com/docs/remote/wsl)
- Once you have WSL installed, you'll need to install NodeJS, NVM, and the AWS CLI in the Linux Subsystem.
  - You may need to use NVM to switch between your Windows node installation and your Linux node installation in order to run shell commands in the Linux environment.
  - You'll also need to copy your .npmrc file the `home/[yourusername]` directory in the Linux file-system (accessed via Windows Explorer by entering \\wsl$ in the nav bar).
- Environment Variables: You can set environment variables for the Linux Subsystem by adding them to your .bashrc file in the WSL filesystem:
  - Open your .bashrc file, typically located in \\wsl$\[your-linux-distrubution]\home\[yourusername]
    - example: \\wsl$\Ubuntu\home\jappleseed\.bashrc
  - At the bottom of the file add your desired environment variables with the word 'export' before each one.
    - example: export ENV_VAR=jappleseed
  - You may need to restart your shell after the change is applied to the .bashrc file.
