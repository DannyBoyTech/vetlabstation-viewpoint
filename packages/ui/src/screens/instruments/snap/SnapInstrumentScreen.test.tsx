import { beforeEach, describe, expect, it } from "vitest";
import { render } from "../../../../test-utils/test-utils";
import { SnapInstrumentScreen, TestId } from "./SnapInstrumentScreen";
import { server } from "../../../../test-utils/mock-server";
import { rest } from "msw";
import { SettingTypeEnum, SpeciesType } from "@viewpoint/api";
import { waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

function getInstrumentScreen() {
  return render(<SnapInstrumentScreen />);
}

const canineSnapResponse = [
  {
    settingType: SettingTypeEnum.SNAP_CANINE4DX,
    displayNamePropertyKey: "Instrument.Snap.Canine.4Dx",
  },
  {
    settingType: SettingTypeEnum.SNAP_CANINE4DXPLUS,
    displayNamePropertyKey: "Instrument.Snap.Canine.4DxPlus",
  },
  {
    settingType: SettingTypeEnum.SNAP_CANINELEISHMANIA,
    displayNamePropertyKey: "Instrument.Snap.Canine.Leishmania",
  },
];
const felineSnapResponse = [
  {
    settingType: SettingTypeEnum.SNAP_FELINECOMBOPLUS,
    displayNamePropertyKey: "Instrument.Snap.Feline.FelineComboPlus",
  },
];
const equineSnapResponse = [
  {
    settingType: SettingTypeEnum.SNAP_EQUINEFOALIGG,
    displayNamePropertyKey: "Instrument.Snap.Equine.FoalIgG",
  },
];

const settings = {
  [SettingTypeEnum.SNAP_CANINE4DX]: "true",
  [SettingTypeEnum.SNAP_CANINE4DXPLUS]: "true",
  [SettingTypeEnum.SNAP_CANINELEISHMANIA]: "false",
  [SettingTypeEnum.SNAP_FELINECOMBOPLUS]: "true",
  [SettingTypeEnum.SNAP_EQUINEFOALIGG]: "true",
};

const speciesResponse = [
  { id: 1, speciesName: SpeciesType.Canine },
  { id: 2, speciesName: SpeciesType.Feline },
  { id: 3, speciesName: SpeciesType.Equine },
  { id: 4, speciesName: SpeciesType.Alpaca },
];

beforeEach(() => {
  // reset settings
  settings[SettingTypeEnum.SNAP_CANINE4DX] = "true";
  settings[SettingTypeEnum.SNAP_CANINE4DXPLUS] = "true";
  settings[SettingTypeEnum.SNAP_FELINECOMBOPLUS] = "true";
  settings[SettingTypeEnum.SNAP_EQUINEFOALIGG] = "true";

  server.use(
    rest.get("**/api/species", (req, res, context) => {
      return res(context.json(speciesResponse));
    }),
    rest.get("**/api/snapDevice/species/1/devices", (req, res, context) => {
      return res(context.json(canineSnapResponse));
    }),
    rest.get("**/api/snapDevice/species/2/devices", (req, res, context) => {
      return res(context.json(felineSnapResponse));
    }),
    rest.get("**/api/snapDevice/species/3/devices", (req, res, context) => {
      return res(context.json(equineSnapResponse));
    }),
    rest.get("**/api/settings", (req, res, context) => {
      return res(context.json(settings));
    }),
    // delay introduced to see update spinner available
    rest.post("**/api/settings", async (req, res, context) => {
      return res(context.delay(100), context.status(200));
    })
  );
});

describe("Test Snap instrument screen", () => {
  it("Spinner displayed and hidden when screen loading", async () => {
    const instrumentScreen = getInstrumentScreen();

    const loadingSpinner = instrumentScreen.container.getElementsByClassName(
      "spot-loading-spinner"
    )[0];
    expect(loadingSpinner).toBeVisible();

    await waitFor(() => {
      expect(loadingSpinner).not.toBeVisible();
    });
  });

  it("Instrument image is displayed", async () => {
    const instrumentScreen = getInstrumentScreen();

    const instrumentImage = await instrumentScreen.findByTestId(
      "instrument-image"
    );
    const img = within(instrumentImage).getByRole("img");
    expect(img).toHaveAttribute("src", expect.stringMatching(/\/SNAP.png$/));
  });

  it("Canine, Feline, Equine tabs are presented", async () => {
    const instrumentScreen = getInstrumentScreen();

    await assertTabActive(instrumentScreen, SpeciesType.Canine, true);
    await assertTabContentVisible(instrumentScreen, SpeciesType.Canine, true);

    await assertTabActive(instrumentScreen, SpeciesType.Feline, false);
    await assertTabContentVisible(instrumentScreen, SpeciesType.Feline, false);

    await assertTabActive(instrumentScreen, SpeciesType.Equine, false);
    await assertTabContentVisible(instrumentScreen, SpeciesType.Equine, false);
  });

  it("Switching to Feline changes content", async () => {
    const instrumentScreen = getInstrumentScreen();
    // when clicking feline tab - other tabs are unselected
    const felineTab = await instrumentScreen.findByTestId(
      TestId.Tab(SpeciesType.Feline)
    );
    await userEvent.click(felineTab);

    await assertTabActive(instrumentScreen, SpeciesType.Canine, false);
    await assertTabContentVisible(instrumentScreen, SpeciesType.Canine, false);

    await assertTabActive(instrumentScreen, SpeciesType.Feline, true);
    await assertTabContentVisible(instrumentScreen, SpeciesType.Feline, true);

    await assertTabActive(instrumentScreen, SpeciesType.Equine, false);
    await assertTabContentVisible(instrumentScreen, SpeciesType.Equine, false);
  });

  it.each([
    [SpeciesType.Canine, SettingTypeEnum.SNAP_CANINE4DX, true],
    [SpeciesType.Canine, SettingTypeEnum.SNAP_CANINE4DXPLUS, false],
    [SpeciesType.Feline, SettingTypeEnum.SNAP_FELINECOMBOPLUS, true],
    [SpeciesType.Equine, SettingTypeEnum.SNAP_EQUINEFOALIGG, true],
  ])(
    "Tab: %s checkbox for %s is selected: %s",
    async (species, setting, checked) => {
      settings[SettingTypeEnum.SNAP_CANINE4DXPLUS] = "false";

      const instrumentScreen = getInstrumentScreen();

      const tab = await instrumentScreen.findByTestId(TestId.Tab(species));
      await userEvent.click(tab);

      const tabContent = await instrumentScreen.findByTestId(
        TestId.TabContent(species)
      );
      expect(tabContent).toBeVisible();

      const checkbox = await within(tabContent).findByTestId(
        TestId.SnapCheckbox(setting)
      );
      expect(checkbox).toBeVisible();

      checked
        ? expect(checkbox).toBeChecked()
        : expect(checkbox).not.toBeChecked();
    }
  );

  it("Setting update disables controls", async () => {
    settings[SettingTypeEnum.SNAP_CANINE4DXPLUS] = "false";
    const instrumentScreen = getInstrumentScreen();
    const checkbox = await instrumentScreen.findByTestId(
      TestId.SnapCheckbox(SettingTypeEnum.SNAP_CANINE4DXPLUS)
    );
    expect(checkbox).toBeVisible();
    expect(checkbox).not.toBeChecked();

    // modify response from server on settings query
    settings[SettingTypeEnum.SNAP_CANINE4DXPLUS] = "true";

    await userEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeDisabled();
    });

    await waitFor(() => {
      expect(checkbox).not.toBeDisabled();
      expect(checkbox).toBeChecked();
    });
  });

  async function assertTabActive(
    wrapper: any,
    speciesType: SpeciesType,
    active: boolean
  ) {
    const tab = await wrapper.findByTestId(TestId.Tab(speciesType));
    expect(tab).toBeVisible();

    active
      ? expect(tab).toHaveAttribute("class", expect.stringMatching(/active$/))
      : expect(tab).not.toHaveAttribute(
          "class",
          expect.stringMatching(/active$/)
        );
  }

  async function assertTabContentVisible(
    wrapper: any,
    speciesType: SpeciesType,
    visible: boolean
  ) {
    if (visible) {
      const tabContent = await wrapper.findByTestId(
        TestId.TabContent(speciesType)
      );
      expect(tabContent).toBeVisible();
    } else {
      const tabContent = await wrapper.queryByTestId(
        TestId.TabContent(speciesType)
      );
      expect(tabContent).not.toBeInTheDocument();
    }
  }
});
