function patchConsole() {
  // See https://github.com/recharts/recharts/issues/3615
  // Ignoring this error because it pollutes the production logs
  const originalWarn = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes(
        "Support for defaultProps will be removed from function components in a future major release."
      )
    ) {
      return;
    }
    originalWarn(...args);
  };
}

export function patchGlobals() {
  patchConsole();
}
