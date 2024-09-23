## app-win7

#### Windows 7 supported version of the ViewPoint Client Electron app

With Electron dropping support for Windows 7 on versions >22, this package exists
as a solution to continue supporting IVLS customers using Windows 7 PCs.

It currently works the following way:

- A separate npm module defines Windows 7-compatible Electron dependencies
- The `premake:win32` npm script will copy the compiled Electron application code
  from the current version `app` module into the `build` folder
  - **Note:** This will only continue to work as long as we don't use newer features in
    the current `app` that aren't available in version 22 of Electron. Hopefully IVLS
    can drop support for Windows 7 before that happens, but if not, then the win7 version
    of the Electron app will have to be duplicated.
- `electron-forge` builds the Electron app with the copied app code, and copies
  the UI distributable as an extra resource.
- The `postmake:win32` npm script cleans up the temporary build folder that contained the
  copied version of the current `app` code.
