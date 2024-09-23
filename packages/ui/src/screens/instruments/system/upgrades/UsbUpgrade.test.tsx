import { beforeEach, describe, expect, vi } from "vitest";
import {
  RemovableDriveDto,
  UpgradePropertiesDto,
  UpgradeResultDto,
  UsbCopyProgressDto,
  UsbUpgradeCopyResultDto,
} from "@viewpoint/api";
import faker from "faker";
import { server } from "../../../../../test-utils/mock-server";
import { rest } from "msw";
import { render } from "../../../../../test-utils/test-utils";
import { TestId as UsbUpgradeTestId, UsbUpgrade } from "./UsbUpgrade";
import { useEventListener } from "../../../../context/EventSourceContext";
import {
  act,
  findByTestId,
  queryByTestId,
  waitFor,
  within,
} from "@testing-library/react";
import { TestId as CopyProgressTestId } from "../../../../components/usb/UsbCopyProgressDialog";
import { TestId as ReadyToUpgradeTestId } from "./ReadyToUpgrade";
import userEvent from "@testing-library/user-event";
import { TestId as UsbSelectorTestId } from "../../../../components/usb/UsbSelectionModal";
import { TestId as UpgradeLetterModalTestId } from "./UpgradeLetterModal";
import { randomRemovableDriveDto } from "@viewpoint/test-utils";

vi.mock("../../../../context/EventSourceContext", async (importOriginal) => ({
  ...((await importOriginal()) as any),
  useEventListener: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});
describe("USB Upgrade", () => {
  // Simple happy path workflow
  it("allows user to initiate the upgrade process from a USB drive", async () => {
    const drive = randomRemovableDriveDto();
    mockGetDrives([drive]);
    mockGetUsbUpgradeProperties({
      [drive.id]: { valid: true, notificationPackagePresent: false },
    });
    mockIsValid({ [drive.id]: true });
    const initiatedCallback = vi.fn();
    const copyId = faker.datatype.uuid();
    captureStartCopy({ copyId });
    const upgradeCapture = capturePerformUpgrade();

    const { container } = render(
      <UsbUpgrade onCancel={vi.fn()} onUpgradeInitiated={initiatedCallback} />
    );
    // Since there's only one drive with a valid upgrade and no upgrade letter, it will go straight to the copy dialog
    await waitFor(async () =>
      expect(
        await queryByTestId(container, CopyProgressTestId.Modal)
      ).toBeVisible()
    );
    // Skip to 100% copy progress
    const eventCallback = vi.mocked(useEventListener).mock.calls[0][1];
    const data: UsbCopyProgressDto = {
      id: "usb_copy_progress",
      percentComplete: 100,
      copyId,
    };
    act(() => eventCallback({ data: JSON.stringify(data) } as MessageEvent));
    // Copy modal closes automatically when 100% is reached
    await waitFor(async () =>
      expect(
        await queryByTestId(container, CopyProgressTestId.Modal)
      ).not.toBeInTheDocument()
    );

    // Remove drives
    mockGetDrives([]);
    await waitFor(async () =>
      expect(
        await queryByTestId(container, ReadyToUpgradeTestId.Modal)
      ).toBeVisible()
    );
    // Hit OK
    const readyModal = await findByTestId(
      container,
      ReadyToUpgradeTestId.Modal
    );
    await userEvent.click(await within(readyModal).findByTestId("done-button"));

    expect(initiatedCallback).toHaveBeenCalled();
    expect(upgradeCapture).toHaveBeenCalledWith({
      usbCopyId: copyId,
      isRead: false,
      path: undefined,
    });
  });

  describe("usb selection", () => {
    it("notifies user if no USB drives are connected", async () => {
      mockGetDrives([]);
      const { container } = render(
        <UsbUpgrade onCancel={vi.fn()} onUpgradeInitiated={vi.fn()} />
      );
      expect(
        await findByTestId(container, UsbUpgradeTestId.NoUpgrade)
      ).toBeVisible();
    });

    it("notifies user if only one USB drive is connected but it does not have a valid upgrade", async () => {
      const drive = randomRemovableDriveDto();
      mockGetDrives([drive]);
      mockGetUsbUpgradeProperties({
        [drive.id]: { valid: false, notificationPackagePresent: false },
      });
      mockIsValid({ [drive.id]: false });

      const { container } = render(
        <UsbUpgrade onCancel={vi.fn()} onUpgradeInitiated={vi.fn()} />
      );
      expect(
        await findByTestId(container, UsbUpgradeTestId.NoUpgrade)
      ).toBeVisible();
    });

    it("allows user to select a USB drive if multiple are found", async () => {
      const drive = randomRemovableDriveDto();
      mockGetDrives([drive, randomRemovableDriveDto()]);
      mockGetUsbUpgradeProperties({
        [drive.id]: { valid: true, notificationPackagePresent: false },
      });
      mockIsValid({ [drive.id]: true });
      captureStartCopy();

      const { container } = render(
        <UsbUpgrade onCancel={vi.fn()} onUpgradeInitiated={vi.fn()} />
      );
      // Wait for the selector modal
      await waitFor(async () =>
        expect(
          await queryByTestId(container, UsbSelectorTestId.Modal)
        ).toBeVisible()
      );
      const nextButton = await findByTestId(
        container,
        UsbSelectorTestId.NextButton
      );
      // Next button is disabled
      expect(nextButton).toBeDisabled();
      // Find the target drive and select it
      await userEvent.click(
        await findByTestId(container, UsbSelectorTestId.DriveListItem(drive.id))
      );
      // Now it's enabled -- click it
      expect(nextButton).toBeEnabled();
      await userEvent.click(nextButton);
      // Proceeds to copy process
      await waitFor(async () =>
        expect(
          await queryByTestId(container, CopyProgressTestId.Modal)
        ).toBeVisible()
      );
    });
    it("proceeds straight to the upgrade process if only one drive is found and it has a valid upgrade", async () => {
      const drive = randomRemovableDriveDto();
      mockGetDrives([drive]);
      mockGetUsbUpgradeProperties({
        [drive.id]: { valid: true, notificationPackagePresent: false },
      });
      mockIsValid({ [drive.id]: true });
      captureStartCopy();

      const { container } = render(
        <UsbUpgrade onCancel={vi.fn()} onUpgradeInitiated={vi.fn()} />
      );
      // Drive has a valid upgrade - Proceeds to copy process
      await waitFor(async () =>
        expect(
          await queryByTestId(container, CopyProgressTestId.Modal)
        ).toBeVisible()
      );
    });
    it("allows user to cancel from the selection window", async () => {
      const drive = randomRemovableDriveDto();
      mockGetDrives([drive, randomRemovableDriveDto()]);
      mockGetUsbUpgradeProperties({
        [drive.id]: { valid: true, notificationPackagePresent: false },
      });
      mockIsValid({ [drive.id]: true });
      const cancelCallback = vi.fn();

      const { container } = render(
        <UsbUpgrade onCancel={cancelCallback} onUpgradeInitiated={vi.fn()} />
      );
      // Wait for the selector modal
      await waitFor(async () =>
        expect(
          await queryByTestId(container, UsbSelectorTestId.Modal)
        ).toBeVisible()
      );
      await userEvent.click(
        await findByTestId(container, UsbSelectorTestId.CancelButton)
      );
      expect(cancelCallback).toHaveBeenCalled();
    });
  });

  describe("upgrade letter", () => {
    it("prompts user to view upgrade letter if one is present", async () => {
      const drive = randomRemovableDriveDto();
      mockGetDrives([drive]);
      mockGetUsbUpgradeProperties({
        [drive.id]: { valid: true, notificationPackagePresent: true },
      });
      mockIsValid({ [drive.id]: true });
      captureStartCopy();

      const { container } = render(
        <UsbUpgrade onCancel={vi.fn()} onUpgradeInitiated={vi.fn()} />
      );
      // User is prompted to view if they want
      await waitFor(
        async () =>
          await expect(
            queryByTestId(container, UpgradeLetterModalTestId.PromptModal)
          ).toBeVisible()
      );

      await userEvent.click(
        await findByTestId(container, UpgradeLetterModalTestId.ReadButton)
      );

      // PDF preview modal is visible
      await waitFor(
        async () =>
          await expect(
            queryByTestId(container, UpgradeLetterModalTestId.PreviewModal)
          ).toBeVisible()
      );
    });
  });

  describe("upgrade confirmation", () => {
    it("warns user multiple times if the user tries to start the upgrade without removing all USB drives", async () => {
      // Mock the upgrade with one valid drive, no upgrade letter
      const drive = randomRemovableDriveDto();
      mockGetDrives([drive]);
      mockGetUsbUpgradeProperties({
        [drive.id]: { valid: true, notificationPackagePresent: false },
      });
      mockIsValid({ [drive.id]: true });
      const initiatedCallback = vi.fn();
      const copyId = faker.datatype.uuid();
      captureStartCopy({ copyId, restartRequired: true });
      const upgradeCapture = capturePerformUpgrade();

      // Perform upgrade copy
      const { container } = render(
        <UsbUpgrade onCancel={vi.fn()} onUpgradeInitiated={initiatedCallback} />
      );
      await waitFor(async () =>
        expect(
          await queryByTestId(container, CopyProgressTestId.Modal)
        ).toBeVisible()
      );
      const eventCallback = vi.mocked(useEventListener).mock.calls[0][1];
      const data: UsbCopyProgressDto = {
        id: "usb_copy_progress",
        percentComplete: 100,
        copyId,
      };
      act(() => eventCallback({ data: JSON.stringify(data) } as MessageEvent));
      await waitFor(async () =>
        expect(
          await queryByTestId(container, CopyProgressTestId.Modal)
        ).not.toBeInTheDocument()
      );

      // Still have drives present after copying is done
      mockGetDrives([drive]);

      // Click OK to perform upgrade
      await waitFor(async () =>
        expect(
          await queryByTestId(container, ReadyToUpgradeTestId.Modal)
        ).toBeVisible()
      );
      const readyModal = await findByTestId(
        container,
        ReadyToUpgradeTestId.Modal
      );
      await userEvent.click(
        await within(readyModal).findByTestId("done-button")
      );

      // Since there are still drives, warning is displayed to user for the first time
      const warningModalOne = await waitFor(() =>
        findByTestId(container, ReadyToUpgradeTestId.WarningModal)
      );
      expect(warningModalOne).toBeVisible();
      // Click OK
      const doneButton = await within(warningModalOne).findByTestId(
        "done-button"
      );
      await userEvent.click(doneButton);

      // Still drives -- warning is displayed one more time to user
      const warningModalTwo = await waitFor(() =>
        findByTestId(container, ReadyToUpgradeTestId.WarningModal)
      );
      expect(warningModalTwo).toBeVisible();
      // Click OK
      const doneButtonTwo = await within(warningModalTwo).findByTestId(
        "done-button"
      );
      await userEvent.click(doneButtonTwo);

      // Upgrade is performed
      await waitFor(() => {
        expect(initiatedCallback).toHaveBeenCalled();
        expect(upgradeCapture).toHaveBeenCalledOnce();
      });
      const upgradeCall = upgradeCapture.mock.calls[0][0];
      expect(upgradeCall.usbCopyId).toEqual(copyId);
      expect(upgradeCall.isRead).toEqual(false);
      expect(upgradeCall.path).toBeUndefined();
    });

    it("proceeds if user removes all removable drives after one warning", async () => {
      // Mock the upgrade with one valid drive, no upgrade letter
      const drive = randomRemovableDriveDto();
      mockGetDrives([drive]);
      mockGetUsbUpgradeProperties({
        [drive.id]: { valid: true, notificationPackagePresent: false },
      });
      mockIsValid({ [drive.id]: true });
      const initiatedCallback = vi.fn();
      const copyId = faker.datatype.uuid();
      captureStartCopy({ copyId, restartRequired: true });
      const upgradeCapture = capturePerformUpgrade();

      // Perform upgrade copy
      const { container } = render(
        <UsbUpgrade onCancel={vi.fn()} onUpgradeInitiated={initiatedCallback} />
      );
      await waitFor(async () =>
        expect(
          await queryByTestId(container, CopyProgressTestId.Modal)
        ).toBeVisible()
      );
      const eventCallback = vi.mocked(useEventListener).mock.calls[0][1];
      const data: UsbCopyProgressDto = {
        id: "usb_copy_progress",
        percentComplete: 100,
        copyId,
      };
      act(() => eventCallback({ data: JSON.stringify(data) } as MessageEvent));
      await waitFor(async () =>
        expect(
          await queryByTestId(container, CopyProgressTestId.Modal)
        ).not.toBeInTheDocument()
      );

      // Still have drives present after copying is done
      mockGetDrives([drive]);

      // Click OK to perform upgrade
      await waitFor(async () =>
        expect(
          await queryByTestId(container, ReadyToUpgradeTestId.Modal)
        ).toBeVisible()
      );
      const readyModal = await findByTestId(
        container,
        ReadyToUpgradeTestId.Modal
      );
      await userEvent.click(
        await within(readyModal).findByTestId("done-button")
      );

      // Since there are still drives, warning is displayed to user for the first time
      const warningModalOne = await waitFor(() =>
        findByTestId(container, ReadyToUpgradeTestId.WarningModal)
      );
      expect(warningModalOne).toBeVisible();
      // Click OK
      const doneButton = await within(warningModalOne).findByTestId(
        "done-button"
      );

      //simulate user removing all drives
      mockGetDrives([]);

      await userEvent.click(doneButton);

      // Upgrade is performed
      await waitFor(() => {
        expect(initiatedCallback).toHaveBeenCalled();
        expect(upgradeCapture).toHaveBeenCalledOnce();
      });
      const upgradeCall = upgradeCapture.mock.calls[0][0];
      expect(upgradeCall.usbCopyId).toEqual(copyId);
      expect(upgradeCall.isRead).toEqual(false);
      expect(upgradeCall.path).toBeUndefined();
    });
  });
});

function mockGetDrives(drives: RemovableDriveDto[]) {
  server.use(
    rest.get("**/api/usb/drives", (req, res, context) =>
      res(context.json(drives))
    )
  );
}

function mockIsValid(isValidMap: Record<string, boolean>) {
  server.use(
    rest.get("**/api/upgrade/valid/USB", (req, res, context) =>
      res(context.json(isValidMap[req.url.searchParams.get("usbId")!]))
    )
  );
}

function mockGetUsbUpgradeProperties(
  propertyMap: Record<string, UpgradePropertiesDto>
) {
  server.use(
    rest.get("**/api/upgrade/usb/properties", (req, res, context) =>
      res(context.json(propertyMap[req.url.searchParams.get("usbId")!]))
    )
  );
}

function captureStartCopy(result?: Partial<UsbUpgradeCopyResultDto>) {
  const captureFn = vi.fn();
  server.use(
    rest.post("**/api/usb/copy/upgrade", async (req, res, context) => {
      captureFn(await req.json);
      return res(
        context.json({
          validUpgrade: true,
          restartRequired: false,
          copyId: faker.datatype.uuid(),
          usbId: req.url.searchParams.get("usbId")!,
          ...result,
        })
      );
    })
  );
  return captureFn;
}

function capturePerformUpgrade(result?: Partial<UpgradeResultDto>) {
  const captureFn = vi.fn();
  server.use(
    rest.post(
      "**/api/upgrade/perform/copied_usb",
      async (req, res, context) => {
        captureFn(await req.json());
        return res(
          context.json({
            validUpgrade: true,
            shutdownRequired: false,
            ...result,
          })
        );
      }
    )
  );
  return captureFn;
}
