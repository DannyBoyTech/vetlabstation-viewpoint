import { describe, it } from "vitest";
import {
  IFrameConfirmModal,
  IFrameConfirmModalProps,
} from "./IFrameConfirmModal";
import { render } from "../../../test-utils/test-utils";
import faker from "faker";
import { server } from "../../../test-utils/mock-server";
import { rest } from "msw";
import { waitFor } from "@testing-library/react";

const elemsInOrder = (first: HTMLElement, second: HTMLElement) => {
  const posns = first.compareDocumentPosition(second);
  const res = posns & Node.DOCUMENT_POSITION_FOLLOWING;
  return !!res;
};

function randomProps(provided: Partial<IFrameConfirmModalProps>) {
  const random: IFrameConfirmModalProps = {
    className: faker.random.alpha({ count: 10 }),
    "data-testid": faker.random.alpha({ count: 10 }),

    open: faker.datatype.boolean(),
    error: faker.datatype.boolean(),

    url: faker.internet.url(),

    timeoutMillis: faker.datatype.number(),

    headerContent: "header|" + faker.random.alpha({ count: 10 }),

    preContent: "pre|" + faker.random.alpha({ count: 10 }),
    postContent: "post|" + faker.random.alpha({ count: 10 }),

    cancelButtonContent: "cancel|" + faker.random.alpha({ count: 10 }),
    confirmButtonContent: "confirm|" + faker.random.alpha({ count: 10 }),

    errorContent: "error|" + faker.random.alpha({ count: 10 }),
  };

  return { ...random, ...provided };
}

const DEFAULT_URL = "http://example.com/path";

describe("IFrame Confirm Modal", () => {
  beforeEach(() => {
    server.use(
      rest.get(DEFAULT_URL, (_req, res, ctx) =>
        res(ctx.set("Content-Type", "application/pdf"), ctx.body(""))
      )
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("should be visible when open", () => {
    const props = randomProps({
      "data-testid": "iframe-confirm-modal",
      url: DEFAULT_URL,
      open: true,
    });

    const screen = render(<IFrameConfirmModal {...props} />);

    const modal = screen.getByTestId("iframe-confirm-modal");

    const modalOverlay = modal.parentElement;

    expect(modalOverlay).toHaveClass("spot-modal__overlay--visible");
  });

  it("should be invisible when not open", () => {
    const props = randomProps({
      "data-testid": "iframe-confirm-modal",
      url: DEFAULT_URL,
      open: false,
    });

    const screen = render(<IFrameConfirmModal {...props} />);

    const modal = screen.getByTestId("iframe-confirm-modal");

    const modalOverlay = modal.parentElement;

    expect(modalOverlay).not.toHaveClass("spot-modal__overlay--visible");
  });

  it("should show confirm button content in confirm button", () => {
    const props = randomProps({
      "data-testid": "iframe-confirm-modal",
      url: DEFAULT_URL,
      open: true,
    });

    const screen = render(<IFrameConfirmModal {...props} />);

    const button = screen.getByRole("button", {
      name: props.confirmButtonContent as string,
    });

    expect(button).toHaveClass("spot-button--primary", "spot-button--default");
  });

  it("should show cancel button content in cancel button", () => {
    const props = randomProps({
      "data-testid": "iframe-confirm-modal",
      url: DEFAULT_URL,
      open: true,
    });

    const screen = render(<IFrameConfirmModal {...props} />);

    const button = screen.getByRole("button", {
      name: props.cancelButtonContent as string,
    });

    expect(button).toHaveTextContent(props.cancelButtonContent as string);

    expect(button).toHaveClass("spot-modal__footer-cancel-button");
  });

  it("should show header content in header", () => {
    const props = randomProps({
      "data-testid": "iframe-confirm-modal",
      url: DEFAULT_URL,
      open: true,
    });

    const screen = render(<IFrameConfirmModal {...props} />);

    const headers = screen.container.querySelectorAll(".spot-modal__header");
    expect(headers).toHaveLength(1);

    const header = headers[0];

    expect(header).toHaveTextContent(props.headerContent as string);
  });

  it("should show loading spinner while content loads and not error", async () => {
    const props = randomProps({
      "data-testid": "iframe-confirm-modal",
      open: true,
      error: false,
      timeoutMillis: undefined,
    });

    server.use(
      rest.get(props.url!, (_req, res, ctx) => {
        return res(ctx.delay("infinite"));
      })
    );

    const screen = render(<IFrameConfirmModal {...props} />);

    const copys = screen.container.querySelectorAll(".spot-modal__copy");
    expect(copys).toHaveLength(1);

    const copy = copys[0];

    const spinners = copy.querySelectorAll("svg.spot-loading-spinner");
    expect(spinners).toHaveLength(1);

    const spinner = spinners[0];
    expect(spinner).toBeVisible();
  });

  it("should show error content if error prop is true", () => {
    const props = randomProps({
      "data-testid": "iframe-confirm-modal",
      url: DEFAULT_URL,
      open: true,
      error: true,
      timeoutMillis: undefined,
    });

    const screen = render(<IFrameConfirmModal {...props} />);

    expect(screen.container).toHaveTextContent(props.errorContent as string);
  });

  // TODO - Native Node18 fetch function does not seem to work with our custom timeout functionality
  it.skip("should show error content if fetch throws", async () => {
    const timeoutMillis = 50;

    const props = randomProps({
      "data-testid": "iframe-confirm-modal",
      open: true,
      error: false,
      timeoutMillis,
    });

    server.use(
      rest.get(props.url!, (_req, res, ctx) => {
        return res(
          ctx.delay(timeoutMillis + 10),
          ctx.set("Content-Type", "application/pdf"),
          ctx.body("")
        );
      })
    );

    const screen = render(<IFrameConfirmModal {...props} />);

    await waitFor(() => {
      expect(screen.container).toHaveTextContent(props.errorContent as string);
    });
  });

  it("should show error content if content fetch fails", async () => {
    const props = randomProps({
      "data-testid": "iframe-confirm-modal",
      open: true,
      error: false,
    });

    server.use(
      rest.get(props.url!, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const screen = render(<IFrameConfirmModal {...props} />);

    await waitFor(() => {
      expect(screen.container).toHaveTextContent(props.errorContent as string);
    });
  });

  it("should show any pre-content before iframe", () => {
    const props = randomProps({
      "data-testid": "iframe-confirm-modal",
      url: DEFAULT_URL,
      open: true,
      error: false,
      preContent: <div data-testid="pre-content" />,
    });

    const screen = render(<IFrameConfirmModal {...props} />);

    const iframes = screen.container.querySelectorAll("iframe");
    expect(iframes).toHaveLength(1);
    const iframe = iframes[0];

    const preContent = screen.getByTestId("pre-content");

    expect(elemsInOrder(preContent, iframe)).toBe(true);
  });

  it("should show any post-content after iframe", () => {
    const props = randomProps({
      "data-testid": "iframe-confirm-modal",
      url: DEFAULT_URL,
      open: true,
      error: false,
      postContent: <div data-testid="post-content" />,
    });

    const screen = render(<IFrameConfirmModal {...props} />);

    const iframes = screen.container.querySelectorAll("iframe");
    expect(iframes).toHaveLength(1);
    const iframe = iframes[0];

    const postContent = screen.getByTestId("post-content");

    expect(elemsInOrder(iframe, postContent)).toBe(true);
  });
});
