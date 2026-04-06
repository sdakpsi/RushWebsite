declare global {
  interface Window {
    __googleIdentityScriptPromise?: Promise<void>;
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (
            config: google.accounts.oauth2.CodeClientConfig,
          ) => google.accounts.oauth2.CodeClient;
        };
      };
    };
  }
}

declare namespace google.accounts.oauth2 {
  interface CodeResponse {
    code?: string;
    scope?: string;
    state?: string;
  }

  interface ErrorResponse {
    message?: string;
    type?: string;
  }

  interface CodeClient {
    requestCode: () => void;
  }

  interface CodeClientConfig {
    callback: (response: CodeResponse) => void | Promise<void>;
    client_id: string;
    error_callback?: (error: ErrorResponse) => void;
    scope: string;
    ux_mode?: "popup" | "redirect";
  }
}

export {};
