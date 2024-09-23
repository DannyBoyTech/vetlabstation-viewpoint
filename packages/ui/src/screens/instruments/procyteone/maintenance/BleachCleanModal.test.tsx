import faker from "faker";
import { describe } from "vitest";
import { render } from "../../../../../test-utils/test-utils";
import { BleachCleanModal } from "./BleachCleanModal";
import { screen, fireEvent } from "@testing-library/react";
import { GlobalModalProvider } from "../../../../components/global-modals/GlobalModals";
import { EventSourceProvider } from "../../../../context/EventSourceContext";

interface BleachCleanTestBedProps {
  instrumentId: number;
  modalId: string;
}

const BleachCleanTestBed = (props: BleachCleanTestBedProps) => (
  <EventSourceProvider>
    <GlobalModalProvider>
      <BleachCleanModal
        instrumentId={props.instrumentId}
        modalId={props.modalId}
      />
    </GlobalModalProvider>
  </EventSourceProvider>
);

describe("BleachCleanModal", () => {
  let instrumentId: number;
  let modalId: string;

  beforeEach(() => {
    instrumentId = faker.datatype.number();
    modalId = faker.datatype.uuid();
  });

  it("should have a 'Cancel' button that closes the modal when clicked", async () => {
    render(
      <BleachCleanTestBed instrumentId={instrumentId} modalId={modalId} />
    );

    const modal = screen.getByTestId("confirm-modal");
    const cancelButton = screen.getByText("Cancel");

    expect(cancelButton).toBeVisible();

    await fireEvent.click(cancelButton);

    expect(modal).toBeVisible();
  });

  it("should not be dismissed by clicking outside", async () => {
    render(
      <BleachCleanTestBed instrumentId={instrumentId} modalId={modalId} />
    );

    const modal = screen.getByTestId("confirm-modal");

    expect(modal).toBeVisible();

    await fireEvent.click(document.body);

    expect(modal).toBeVisible();
  });
});
