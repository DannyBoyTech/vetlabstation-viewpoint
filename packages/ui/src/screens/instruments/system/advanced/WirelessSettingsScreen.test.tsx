import { useNavigate } from "react-router-dom";
import { render } from "../../../../../test-utils/test-utils";
import { TestId, WirelessSettingsScreen } from "./WirelessSettingsScreen";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { randomIvlsRouterDto } from "@viewpoint/test-utils";
import { server } from "../../../../../test-utils/mock-server";
import faker from "faker";
import { IvlsRouterDto, RouterType, WanIpChoiceEnum } from "@viewpoint/api";
import { waitFor } from "@testing-library/dom";
import { EventSourceProvider } from "../../../../context/EventSourceContext";
import { within } from "@testing-library/react";

vi.mock("react-router-dom", async (origImport) => ({
  ...((await origImport()) as any),
  useNavigate: vi.fn(),
}));

function getRouterHandler(
  responsePayload: IvlsRouterDto,
  delayMillis?: number
) {
  return rest.get("*/api/router", (_req, res, ctx) =>
    res(ctx.delay(delayMillis), ctx.json(responsePayload))
  );
}

function hangingRouterHandler() {
  return rest.get("*/api/router", (_req, res, ctx) =>
    res(ctx.delay("infinite"))
  );
}

function failingRouterHandler() {
  return rest.get("*/api/router", (_req, res, ctx) => res(ctx.status(10)));
}

const DEFAULT_GET_ROUTER_HANDLER = getRouterHandler(randomIvlsRouterDto());

function putRouterHandler(responsePayload: boolean, delayMillis?: number) {
  return rest.put("*/api/router/configuration/wireless", (_req, res, ctx) =>
    res(ctx.delay(delayMillis), ctx.json(responsePayload))
  );
}

const DEFAULT_PUT_ROUTER_HANDLER = putRouterHandler(true);

function getRandomPasswordHandler(
  responsePayload: string,
  delayMillis?: number
) {
  return rest.get("*/api/system/randomPassword", (_req, res, ctx) =>
    res(ctx.delay(delayMillis), ctx.text(responsePayload))
  );
}
const DEFAULT_GET_PASSWORD_HANDLER = getRandomPasswordHandler(
  faker.datatype.string(13)
);

function getWirelessToggle(screen: ReturnType<typeof render>) {
  const wirelessSection = screen.getByTestId(TestId.WirelessSection);
  const toggle = wirelessSection.querySelector("input");
  expect(toggle).not.toBeNull();
  return toggle!;
}

describe("wireless settings screen", () => {
  const nav = vi.fn();

  const eventSource = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  function renderScreen() {
    return render(
      <EventSourceProvider>
        <WirelessSettingsScreen />
      </EventSourceProvider>
    );
  }

  beforeEach(() => {
    vi.mocked(useNavigate).mockImplementation(() => nav);

    //default api responses
    server.use(
      DEFAULT_GET_ROUTER_HANDLER,
      DEFAULT_PUT_ROUTER_HANDLER,
      DEFAULT_GET_PASSWORD_HANDLER
    );
  });

  it("should navigate back when back is clicked", async () => {
    const screen = renderScreen();
    const backButton = screen.getByTestId(TestId.BackButton);

    await userEvent.click(backButton);

    expect(nav).toHaveBeenCalledOnce();
    expect(nav).toHaveBeenCalledWith(-1);
  });

  it("should prompt user to confirm discarding changes", async () => {
    server.resetHandlers();

    server.use(
      getRouterHandler(
        randomIvlsRouterDto({
          wanIpChoice: WanIpChoiceEnum.DYNAMIC,
          routerType: RouterType.NETGEAR, //do not want reboot modal to be shown, so no linksys
        })
      ),
      DEFAULT_GET_PASSWORD_HANDLER,
      DEFAULT_PUT_ROUTER_HANDLER
    );

    const screen = renderScreen();

    await waitFor(async () => {
      const genPassButton = screen.getByTestId(TestId.GeneratePasswordButton);
      expect(genPassButton).toBeEnabled();
    });

    const genPassButton = screen.getByTestId(TestId.GeneratePasswordButton);
    await userEvent.click(genPassButton);

    await waitFor(async () => {
      const cancelButton = screen.getByTestId(TestId.CancelButton);
      expect(cancelButton).toBeEnabled();
    });

    const cancelButton = screen.getByTestId(TestId.CancelButton);
    await userEvent.click(cancelButton);

    await waitFor(async () => {
      const cancelModal = screen.getByTestId(TestId.CancelModal);
      expect(cancelModal).toBeVisible();
    });
  });

  it("should not prompt follwing cancel if changes are same as fetched", async () => {
    server.resetHandlers();

    server.use(
      getRouterHandler(
        randomIvlsRouterDto({
          wanIpChoice: WanIpChoiceEnum.DYNAMIC,
          routerType: RouterType.NETGEAR, //do not want reboot modal to be shown, so no linksys
          wirelessEnabled: false,
        })
      ),
      DEFAULT_GET_PASSWORD_HANDLER,
      DEFAULT_PUT_ROUTER_HANDLER
    );

    const screen = renderScreen();

    await waitFor(async () => {
      const toggle = getWirelessToggle(screen);
      expect(toggle).toBeEnabled();
    });

    // change a setting
    await userEvent.click(getWirelessToggle(screen));

    await waitFor(async () => {
      const toggle = getWirelessToggle(screen);
      expect(toggle).toBeChecked();
    });

    //change it back
    await userEvent.click(getWirelessToggle(screen));

    await waitFor(async () => {
      const toggle = getWirelessToggle(screen);
      expect(toggle).not.toBeChecked();
    });

    await waitFor(async () => {
      const cancelButton = screen.getByTestId(TestId.CancelButton);
      expect(cancelButton).toBeEnabled();
    });

    await userEvent.click(screen.getByTestId(TestId.CancelButton));

    //check that modal doesn't show in near future, because there was no real change being lost
    await expect(
      waitFor(
        async () => {
          expect(screen.getByTestId(TestId.CancelModal));
        },
        { timeout: 50 }
      )
    ).rejects.toThrow();
  });

  it("should discard changes and display original values following cancel confirmation", async () => {
    server.resetHandlers();

    const origRouterInfo = randomIvlsRouterDto({
      wanIpChoice: WanIpChoiceEnum.DYNAMIC,
      routerType: RouterType.NETGEAR, //do not want reboot modal to be shown, so no linksys
      wirelessEnabled: false,
    });

    server.use(
      getRouterHandler(origRouterInfo),
      DEFAULT_GET_PASSWORD_HANDLER,
      DEFAULT_PUT_ROUTER_HANDLER
    );

    const screen = renderScreen();

    await waitFor(async () => {
      const toggle = getWirelessToggle(screen);
      expect(toggle).toBeEnabled();
    });

    // change a setting
    await userEvent.click(getWirelessToggle(screen));

    await waitFor(async () => {
      const cancelButton = screen.getByTestId(TestId.CancelButton);
      expect(cancelButton).toBeEnabled();
    });

    await userEvent.click(screen.getByTestId(TestId.CancelButton));

    let cancelModal: HTMLElement | null = screen.getByTestId(
      TestId.CancelModal
    );
    expect(cancelModal).toBeVisible();

    const confirmCancelButton = within(cancelModal).getByRole("button", {
      name: "Discard",
    });
    expect(confirmCancelButton).toBeVisible();

    await userEvent.click(confirmCancelButton);

    cancelModal = await screen.queryByTestId(TestId.CancelModal);
    expect(cancelModal).not.toBeInTheDocument();

    await waitFor(async () => {
      const toggle = getWirelessToggle(screen);
      expect(toggle.checked).toEqual(origRouterInfo.wirelessEnabled);
    });
  });

  it("should display reboot warning modal if router requires reboot", async () => {
    server.resetHandlers();

    const origRouterInfo = randomIvlsRouterDto({
      wanIpChoice: WanIpChoiceEnum.DYNAMIC,
      routerType: RouterType.LINKSYS, //use a router that requires reboot
      wirelessEnabled: false,
    });

    server.use(
      getRouterHandler(origRouterInfo),
      DEFAULT_GET_PASSWORD_HANDLER,
      DEFAULT_PUT_ROUTER_HANDLER
    );

    const screen = renderScreen();

    await waitFor(async () => {
      const toggle = getWirelessToggle(screen);
      expect(toggle).toBeEnabled();
    });

    // change a setting
    await userEvent.click(getWirelessToggle(screen));

    await waitFor(async () => {
      const applyButton = screen.getByTestId(TestId.ApplyChangesButton);
      expect(applyButton).toBeEnabled();
    });

    await userEvent.click(screen.getByTestId(TestId.ApplyChangesButton));

    expect(screen.getByTestId(TestId.RebootModal)).toBeVisible();
  });

  describe("password section", () => {
    it("should display password placeholder regardless of fetch state", () => {
      const screen = renderScreen();

      const passwordInput = screen.getByTestId(TestId.PasswordInput);
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toBeDisabled();
    });

    it("should disable password generation if router is unknown", () => {
      server.resetHandlers();
      server.use(
        rest.get("*/api/router", (_req, res, ctx) =>
          res(
            ctx.json(
              randomIvlsRouterDto({ wanIpChoice: WanIpChoiceEnum.UNKNOWN })
            )
          )
        )
      );
    });

    it("should disable password generation if current state fetch is loading", async () => {
      server.resetHandlers();

      server.use(
        hangingRouterHandler(),
        DEFAULT_GET_PASSWORD_HANDLER,
        DEFAULT_PUT_ROUTER_HANDLER
      );

      const screen = renderScreen();

      await waitFor(() => {
        const genPassButton = screen.getByTestId(TestId.GeneratePasswordButton);
        expect(genPassButton).toBeDisabled();
      });
    });

    it("should disable password generation if current state fetch fails", async () => {
      server.resetHandlers();

      server.use(
        failingRouterHandler(),
        DEFAULT_GET_PASSWORD_HANDLER,
        DEFAULT_PUT_ROUTER_HANDLER
      );

      const screen = renderScreen();

      await waitFor(() => {
        const genPassButton = screen.getByTestId(TestId.GeneratePasswordButton);
        expect(genPassButton).toBeDisabled();
      });
    });

    it("should show new password after generation, until application of changes", async () => {
      server.resetHandlers();

      const newPassword = faker.datatype.string(13);

      server.use(
        getRouterHandler(
          randomIvlsRouterDto({
            wanIpChoice: WanIpChoiceEnum.DYNAMIC,
          })
        ),
        getRandomPasswordHandler(newPassword),
        DEFAULT_PUT_ROUTER_HANDLER
      );

      const screen = renderScreen();

      await waitFor(async () => {
        const genPassButton = screen.getByTestId(TestId.GeneratePasswordButton);
        expect(genPassButton).toBeEnabled();
      });

      const genPassButton = screen.getByTestId(TestId.GeneratePasswordButton);
      await userEvent.click(genPassButton);

      await waitFor(async () => {
        const passwordInput = screen.getByTestId(TestId.PasswordInput);
        expect(passwordInput).toHaveAttribute("type", "text");
        expect(passwordInput).toBeDisabled();
        expect(passwordInput).toHaveValue(newPassword);
      });
    });

    it("should enable apply changes button after user generates password", async () => {
      server.resetHandlers();

      server.use(
        getRouterHandler(
          randomIvlsRouterDto({
            wanIpChoice: WanIpChoiceEnum.DYNAMIC,
          })
        ),
        DEFAULT_GET_PASSWORD_HANDLER,
        DEFAULT_PUT_ROUTER_HANDLER
      );

      const screen = renderScreen();

      await waitFor(async () => {
        const genPassButton = screen.getByTestId(TestId.GeneratePasswordButton);
        expect(genPassButton).toBeEnabled();
      });

      const genPassButton = screen.getByTestId(TestId.GeneratePasswordButton);
      await userEvent.click(genPassButton);

      await waitFor(async () => {
        const applyChangesButton = screen.getByTestId(
          TestId.ApplyChangesButton
        );
        expect(applyChangesButton).toBeEnabled();
      });
    });

    it("should disable apply changes after button is clicked", async () => {
      server.resetHandlers();

      server.use(
        getRouterHandler(
          randomIvlsRouterDto({
            wanIpChoice: WanIpChoiceEnum.DYNAMIC,
            routerType: RouterType.NETGEAR, //do not want reboot modal to be shown, so no linksys
          })
        ),
        DEFAULT_GET_PASSWORD_HANDLER,
        putRouterHandler(true, 10)
      );

      const screen = renderScreen();

      await waitFor(async () => {
        const genPassButton = screen.getByTestId(TestId.GeneratePasswordButton);
        expect(genPassButton).toBeEnabled();
      });

      const genPassButton = screen.getByTestId(TestId.GeneratePasswordButton);
      await userEvent.click(genPassButton);

      await waitFor(async () => {
        const applyChangesButton = screen.getByTestId(
          TestId.ApplyChangesButton
        );
        expect(applyChangesButton).toBeEnabled();
      });

      const applyChangesButton = screen.getByTestId(TestId.ApplyChangesButton);
      await userEvent.click(applyChangesButton);

      await waitFor(async () => {
        const applyChangesButton = screen.getByTestId(
          TestId.ApplyChangesButton
        );
        expect(applyChangesButton).toBeDisabled();
      });
    });
  });

  describe("antenna section", () => {
    it("should display current antenna state if fetch succeeds", async () => {
      const routerStatus = randomIvlsRouterDto({
        wanIpChoice: WanIpChoiceEnum.DYNAMIC,
      });

      const routerHandler = getRouterHandler(routerStatus);

      server.resetHandlers();
      server.use(
        routerHandler,
        DEFAULT_GET_PASSWORD_HANDLER,
        DEFAULT_PUT_ROUTER_HANDLER
      );

      const screen = renderScreen();

      await waitFor(async () => {
        const toggle = getWirelessToggle(screen);

        if (routerStatus.wirelessEnabled) {
          expect(toggle).toBeChecked();
        } else {
          expect(toggle).not.toBeChecked();
        }
      });
    });

    it("should disable modification of antenna state if router is unknown", async () => {
      const routerStatus = randomIvlsRouterDto({
        wanIpChoice: WanIpChoiceEnum.UNKNOWN,
      });

      const routerHandler = getRouterHandler(routerStatus);
      server.resetHandlers();
      server.use(
        routerHandler,
        DEFAULT_GET_PASSWORD_HANDLER,
        DEFAULT_PUT_ROUTER_HANDLER
      );

      const screen = renderScreen();

      await waitFor(async () => {
        const toggle = getWirelessToggle(screen);

        expect(toggle).toBeDisabled();
      });
    });

    it("should disable modification of antenna state if current state fetch is loading", async () => {
      server.resetHandlers();

      server.use(
        hangingRouterHandler(),
        DEFAULT_GET_PASSWORD_HANDLER,
        DEFAULT_PUT_ROUTER_HANDLER
      );

      const screen = renderScreen();

      await waitFor(async () => {
        const toggle = getWirelessToggle(screen);

        expect(toggle).toBeDisabled();
      });
    });

    it("should disable modification of antenna state if current state fetch fails", async () => {
      server.resetHandlers();

      server.use(
        failingRouterHandler(),
        DEFAULT_GET_PASSWORD_HANDLER,
        DEFAULT_PUT_ROUTER_HANDLER
      );

      const screen = renderScreen();

      await waitFor(async () => {
        const toggle = getWirelessToggle(screen);
        expect(toggle).toBeDisabled();
      });
    });

    it("should enable apply changes button after user changes antenna state", async () => {
      const origRouterStatus = randomIvlsRouterDto({
        wanIpChoice: WanIpChoiceEnum.DYNAMIC,
      });

      server.resetHandlers();

      server.use(
        getRouterHandler(origRouterStatus),
        DEFAULT_GET_PASSWORD_HANDLER,
        DEFAULT_PUT_ROUTER_HANDLER
      );

      const screen = renderScreen();

      await waitFor(async () => {
        const applyChangesButton = screen.getByTestId(
          TestId.ApplyChangesButton
        );
        expect(applyChangesButton).toBeDisabled();
      });

      await waitFor(async () => {
        const toggle = getWirelessToggle(screen);
        expect(toggle).toBeEnabled();
      });

      const toggle = getWirelessToggle(screen);
      await userEvent.click(toggle);

      await waitFor(async () => {
        const applyChangesButton = screen.getByTestId(
          TestId.ApplyChangesButton
        );
        expect(applyChangesButton).toBeEnabled();
      });
    });

    it("should display enabled cancel button after user changes antenna state", async () => {
      const origRouterStatus = randomIvlsRouterDto({
        wanIpChoice: WanIpChoiceEnum.DYNAMIC,
      });

      server.resetHandlers();

      server.use(
        getRouterHandler(origRouterStatus),
        DEFAULT_GET_PASSWORD_HANDLER,
        DEFAULT_PUT_ROUTER_HANDLER
      );

      const screen = renderScreen();

      await waitFor(async () => {
        const toggle = getWirelessToggle(screen);
        expect(toggle).toBeEnabled();
      });

      const toggle = getWirelessToggle(screen);
      await userEvent.click(toggle);

      await waitFor(async () => {
        const cancelButton = screen.getByTestId(TestId.CancelButton);
        expect(cancelButton).toBeEnabled();
      });
    });
  });
});
