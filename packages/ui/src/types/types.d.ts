declare namespace React {
  /**
   * This allows us to provide the "data-testid" attribute to a component via typed props without
   * having to extend all of the interfaces manually, e.g.:
   *
   * function WrappedInput(props: {innerInputProps: InputHTMLAttributes<HTMLInputElement>}) {
   *   return (<input {...props.innerInputProps}>);
   * }
   *
   * <WrappedInput innerInputProps={{"data-testid": "test-id"}}/>
   *
   */
  interface DOMAttributes<T> extends React.DOMAttributes<T> {
    "data-testid"?: string;
  }
}

interface Window {
  main?: {
    send(channel: "kb-input" | "beep" | "shutdown", ...args: any[]): void;
    getAppVersion: () => string | undefined;
    getNoI18n: () => boolean | undefined;
    getEnv: () => string | undefined;
    getHeapEnvId: () => string | undefined;
  };
  heap?: Heap;
}

interface Heap {
  track: (event: string, properties?: object) => void;
  identify: (identity: string) => void;
  resetIdentity: () => void;
  addUserProperties: (properties: object) => void;
  addEventProperties: (properties: object) => void;
  removeEventProperty: (property: string) => void;
  clearEventProperties: () => void;
  appid: string;
  userId: string;
  identity: string | null;
  config: any;
}
