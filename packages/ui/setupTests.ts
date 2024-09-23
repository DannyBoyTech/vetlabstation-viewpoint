import "@testing-library/jest-dom/vitest";
import "cross-fetch/polyfill";
import i18n from "i18next";
import { setupStore } from "./src/redux/store";
import { viewpointApi } from "./src/api/ApiSlice";
import { server } from "./test-utils/mock-server";
import { initReactI18next } from "react-i18next";
import en from "./public/locales/en/translation.json";
import fr from "./public/locales/fr_fr/translation.json";
import alerts from "./public/locales/en/alerts.json";
import formats from "./public/locales/en/formats.json";
import { randomUUID } from "node:crypto";

// Dayjs plugins
import "./src/utils/dayjs-setup";
import { rest } from "msw";
import { vi } from "vitest";
import {
  getEventSource,
  QueuingEventSource,
} from "./src/utils/events/QueuingEventSource";

vi.mock("./src/utils/events/QueuingEventSource", async (orig) => ({
  ...((await orig()) as any),
  getEventSource: vi.fn(),
}));

// Don't use backend plugin for i18next, it will try to make an HTTP request for translations and blow up the tests when it fails
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: "en",
    ns: ["translation", "alerts", "formats"],
    resources: {
      en: { translation: en, alerts: alerts, formats: formats },
      fr: { translation: fr, alerts: alerts },
    },
  })
  .catch((err) => console.error(err));

// jsdom does not implement scrollTo/scrollIntoView (https://github.com/jsdom/jsdom/blob/master/lib/jsdom/browser/Window.js#L904)
// we use it when focusing on inputs, so just stub it here to get rid of all the errors
window.HTMLElement.prototype.scrollTo = function () {};
window.HTMLElement.prototype.scrollIntoView = function () {};

// It also does not provide a randomUUID function pass in the one node provides
window.crypto.randomUUID = randomUUID;

// add missing URL.createObjectURL and URL.revokeObjectURL
window.URL.createObjectURL = () =>
  `blob:${window.location.origin}/${randomUUID()}`;
window.URL.revokeObjectURL = () => {};

// jsdom does not provide ResizeObserver
window.ResizeObserver = class ResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
};

window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

const store = setupStore();

beforeEach(() => {
  server.use(
    rest.get("**/api/system/running", (req, res, context) =>
      res(context.json(true))
    )
  );
  vi.resetAllMocks();
  vi.mocked(getEventSource).mockReturnValue({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    connect: vi.fn(),
  } as unknown as QueuingEventSource);
});

// Establish API mocking before all tests.
beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
  // Clear RTK query cache
  store.dispatch(viewpointApi.util.resetApiState());
});

// Clean up after the tests are finished.
afterAll(() => server.close());
