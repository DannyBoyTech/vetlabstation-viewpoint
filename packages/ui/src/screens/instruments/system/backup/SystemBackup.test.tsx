import { describe, expect, vi } from "vitest";
import { server } from "../../../../../test-utils/mock-server";
import { rest } from "msw";
import { render } from "../../../../../test-utils/test-utils";
import { SystemBackup, TestId } from "./SystemBackup";
import { findByTestId, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("./UsbBackup", async (importOriginal) => ({
  ...((await importOriginal()) as any),
  UsbBackup: () => <div data-testid="mock-usb-backup" />,
}));

describe("system backup", () => {
  it("shows an error if the SmartService agent is not available and attempts to restart the service", async () => {
    // Agent is not running
    let agentStatus = false;
    server.use(
      rest.get("**/api/backup/agent/status", (req, res, context) =>
        res(context.json(agentStatus))
      )
    );
    server.use(
      rest.post("**/api/backup/agent/doRecover", (req, res, context) => {
        // Set agent to running when the client tries to recover
        agentStatus = true;
        return res(context.json(agentStatus));
      })
    );

    const { container, unmount } = render(<SystemBackup onCancel={vi.fn()} />);

    const noAgentModal = await findByTestId(container, TestId.NoAgentModal);
    expect(noAgentModal).toBeVisible();
    await userEvent.click(
      await within(noAgentModal).findByTestId("done-button")
    );

    // Unmount and try again -- the last component should have made a call to
    // the recover endpoint, which will flip the status to running -- this
    // new component should re-check the status and continue with the backup
    unmount();
    const { container: newContainer } = render(
      <SystemBackup onCancel={vi.fn()} />
    );

    expect(await findByTestId(newContainer, "mock-usb-backup")).toBeVisible();
  });
});
