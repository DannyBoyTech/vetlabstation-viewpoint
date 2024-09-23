import { describe, expect, it, vi } from "vitest";
import {
  BackupMetadataDto,
  BackupMetadataWrapperDto,
  RemovableDriveDto,
  UsbCopyProgressDto,
} from "@viewpoint/api";
import { server } from "../../../../../test-utils/mock-server";
import { rest } from "msw";
import faker from "faker";
import { randomRemovableDriveDto } from "@viewpoint/test-utils";
import { render } from "../../../../../test-utils/test-utils";
import { TestId as UsbBackupTestId, UsbBackup } from "./UsbBackup";
import userEvent from "@testing-library/user-event";
import { act, waitFor, within } from "@testing-library/react";
import { TestId as SelectionModalTestId } from "../../../../components/usb/UsbSelectionModal";
import { useEventListener } from "../../../../context/EventSourceContext";
import { TestId as DeleteBackupsTestId } from "./DeleteBackupsModal";
import dayjs from "dayjs";

vi.mock("../../../../context/EventSourceContext", async (importOriginal) => ({
  ...((await importOriginal()) as any),
  useEventListener: vi.fn(),
}));

describe("USB Backup", () => {
  // Happy path
  it("allows user to generate a backup", async () => {
    const onCancel = vi.fn();
    const onDone = vi.fn();

    const { findByTestId, findByRole } = render(
      <UsbBackup onCancel={onCancel} onDone={onDone} />
    );

    // User is instructed to insert a USB drive and tap next
    const insertPrompt = await findByTestId(UsbBackupTestId.InsertPrompt);
    expect(insertPrompt).toBeVisible();

    const drive = randomRemovableDriveDto();
    mockGetDrives([drive]);

    // Move to USB selection
    await userEvent.click(
      await within(insertPrompt).findByRole("button", { name: "Next" })
    );
    const selectionModal = await findByTestId(SelectionModalTestId.Modal);
    expect(selectionModal).toBeVisible();
    await userEvent.click(
      (
        await within(selectionModal).findAllByRole("listitem")
      ).find((item) => item.textContent === drive.label)!
    );

    // Move into prepare/copy phase
    const { captureFn: backupCapture } = captureCreateBackup();
    mockWaitForBackup();
    captureCalculateBackupSize(100);
    const { captureFn: copyCapture, copyId } = captureStartCopy();
    await userEvent.click(await findByRole("button", { name: "Next" }));
    expect(backupCapture).toHaveBeenCalled();
    await waitFor(() => expect(copyCapture).toHaveBeenCalled());

    // Push copy progress to 100%
    const eventCallback = vi.mocked(useEventListener).mock.calls.pop()![1];
    const data: UsbCopyProgressDto = {
      id: "usb_copy_progress",
      copyId,
      percentComplete: 100,
    };
    act(() => eventCallback({ data: JSON.stringify(data) } as MessageEvent));

    // Click finish
    expect(onDone).not.toHaveBeenCalled();
    await waitFor(async () =>
      expect(await findByRole("button", { name: "Finish" })).toBeEnabled()
    );
    await userEvent.click(await findByRole("button", { name: "Finish" }));
    expect(onDone).toHaveBeenCalled();
  });

  it("prompts user if the capacity of the selected USB drive cannot fit the backup", async () => {
    const onCancel = vi.fn();
    const onDone = vi.fn();

    const { findByTestId, findByRole } = render(
      <UsbBackup onCancel={onCancel} onDone={onDone} />
    );

    // User is instructed to insert a USB drive and tap next
    const insertPrompt = await findByTestId(UsbBackupTestId.InsertPrompt);
    const drive = randomRemovableDriveDto({ capacity: 10000 });
    mockGetDrives([drive]);

    // Move to USB selection
    await userEvent.click(
      await within(insertPrompt).findByRole("button", { name: "Next" })
    );
    const selectionModal = await findByTestId(SelectionModalTestId.Modal);
    await userEvent.click(
      (
        await within(selectionModal).findAllByRole("listitem")
      ).find((item) => item.textContent === drive.label)!
    );

    // Move into prepare/copy phase
    captureCreateBackup();
    mockWaitForBackup();
    const { captureFn: backupSizeCapture } = captureCalculateBackupSize(11000);
    await userEvent.click(await findByRole("button", { name: "Next" }));
    await waitFor(() => expect(backupSizeCapture).toHaveBeenCalled());

    // Since backup size is > capacity of the drive, warning is shown to user and workflow is ended
    expect(
      await findByTestId(UsbBackupTestId.NotEnoughCapacityPrompt)
    ).toBeVisible();
    await userEvent.click(await findByRole("button", { name: "OK" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("allows user to remove older backups if there is not enough free space on the drive", async () => {
    const onCancel = vi.fn();
    const onDone = vi.fn();

    const { findByTestId, findByRole, findByText } = render(
      <UsbBackup onCancel={onCancel} onDone={onDone} />
    );

    // User is instructed to insert a USB drive and tap next
    const insertPrompt = await findByTestId(UsbBackupTestId.InsertPrompt);
    const drive = randomRemovableDriveDto({ freeSpace: 10000 });
    mockGetDrives([drive]);

    // Move to USB selection
    await userEvent.click(
      await within(insertPrompt).findByRole("button", { name: "Next" })
    );
    const selectionModal = await findByTestId(SelectionModalTestId.Modal);
    await userEvent.click(
      (
        await within(selectionModal).findAllByRole("listitem")
      ).find((item) => item.textContent === drive.label)!
    );

    // Move into prepare/copy phase
    captureCreateBackup();
    mockWaitForBackup();
    const candidates = [
      randomBackupWrapper(),
      randomBackupWrapper(),
      randomBackupWrapper(),
      randomBackupWrapper(),
    ];
    mockGetDeletableCandidates(candidates);
    const { captureFn: backupSizeCapture } = captureCalculateBackupSize(11000);
    await userEvent.click(await findByRole("button", { name: "Next" }));
    await waitFor(() => expect(backupSizeCapture).toHaveBeenCalled());

    // Since backup size is > free space of the drive, user is prompted to delete old backups
    expect(await findByTestId(DeleteBackupsTestId.Modal)).toBeVisible();
    // Wait for OK button to be ready
    await waitFor(async () =>
      expect(await findByRole("button", { name: "OK" })).toBeEnabled()
    );
    // Verify entries
    const timeFormat = "MMMM D, YYYY h:mm A";
    for (const candidate of candidates) {
      expect(
        await findByText(
          dayjs(candidate.backupMetadataDto.timestamp).format(timeFormat)
        )
      ).toBeVisible();
    }
    // Click OK to delete
    const { captureFn: deleteCapture } = captureDeleteBackups(true);
    await userEvent.click(await findByRole("button", { name: "OK" }));
    expect(deleteCapture).toHaveBeenCalledWith(candidates);
  });
});

function mockGetDrives(drives: RemovableDriveDto[]) {
  server.use(
    rest.get("**/api/usb/drives", (req, res, context) =>
      res(context.json(drives))
    )
  );
}

function captureCreateBackup(result?: string) {
  const backupId = result ?? faker.datatype.uuid();
  const captureFn = vi.fn();
  server.use(
    rest.post("**/api/backup", async (req, res, context) => {
      captureFn();
      return res(context.json(backupId));
    })
  );
  return { captureFn, backupId };
}

function mockWaitForBackup(
  response?: Partial<BackupMetadataWrapperDto>,
  timeout?: number
) {
  server.use(
    rest.get("**/api/backup/await", async (req, res, context) => {
      await new Promise((resolve) => setTimeout(resolve, timeout ?? 1));
      return res(context.json(response ?? randomBackupWrapper()));
    })
  );
}

function captureCalculateBackupSize(result?: number) {
  const size = result ?? 1000;
  const captureFn = vi.fn();
  server.use(
    rest.post("**/api/usb/backup/size", async (req, res, context) => {
      captureFn(await req.json());
      return res(context.json(size));
    })
  );
  return { captureFn, size };
}

function captureStartCopy(result?: string) {
  const captureFn = vi.fn();
  const copyId = result ?? faker.datatype.uuid();
  server.use(
    rest.post("**/api/usb/backup", async (req, res, context) => {
      captureFn(await req.json());
      return res(context.text(copyId));
    })
  );
  return { captureFn, copyId };
}

function mockGetDeletableCandidates(result?: BackupMetadataWrapperDto[]) {
  server.use(
    rest.get("**/api/usb/backup/deletable", (req, res, context) =>
      res(context.json(result ?? [randomBackupWrapper()]))
    )
  );
}

function captureDeleteBackups(result?: boolean) {
  const captureFn = vi.fn();
  const success = result ?? true;
  server.use(
    rest.post("**/api/usb/backup/delete", async (req, res, context) => {
      captureFn(await req.json());
      return res(context.json(success));
    })
  );
  return { captureFn, success };
}

const randomBackupWrapper = (
  provided?: Partial<BackupMetadataWrapperDto>
): BackupMetadataWrapperDto => {
  return {
    metadataFilePath: faker.system.filePath(),
    backupMetadataDto: randomBackupMetadata(),
    ...provided,
  };
};

const randomBackupMetadata = (
  provided?: Partial<BackupMetadataDto>
): BackupMetadataDto => ({
  backupId: faker.datatype.uuid(),
  timestamp: faker.date.past(1).getTime(),
  ivlsSoftwareVersion: faker.system.semver(),
  backupSources: [],
  source: faker.system.fileName(),
  ivlsVersion: faker.system.semver(),
  ...provided,
});
