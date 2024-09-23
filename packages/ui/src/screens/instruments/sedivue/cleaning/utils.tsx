import HalfDoorCartridgeHolder from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/halfDoor/HD_Cartridge_holder.webm";
import HalfDoorCatridgeTrack from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/halfDoor/HD_Cartridge_track.webm";
import HalfDoorCentrifugeArm from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/halfDoor/HD_Centrifuge_arm.webm";
import HalfDoorPipettingWindow from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/halfDoor/HD_Pipetting_Window.png";
import HalfDoorMoveArm from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/halfDoor/HD_Move_arm.webm";
import HalfDoorOpticalWindow from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/halfDoor/HD_Optical_window.webm";
import HalfDoorInstrument from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/halfDoor/HD_SediVueDx.png";
import HalfDoorShieldWasteBinOne from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/halfDoor/HD_Shield_waste_bin_1.png";
import HalfDoorShieldWasteBinTwo from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/halfDoor/HD_Shield_waste_bin_2.png";
import HalfDoorReplaceComponents from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/halfDoor/HD_Replace_components.png";
import HalfDoorFanFilter from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/halfDoor/HD_Clean_fan_filter.png";

import FullDoorCartridgeHolder from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/fullDoor/FD_Cartridge_holder.webm";
import FullDoorPusherArm from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/fullDoor/FD_Pusher_arm.webm";
import FullDoorPipettingWindow from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/fullDoor/FD_Pipetting_Window.png";
import FullDoorMoveArm from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/fullDoor/FD_Move_arm.png";
import FullDoorOpticalWindow from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/fullDoor/FD_Optical_window.webm";
import FullDoorInstrument from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/fullDoor/FD_SediVueDx.png";
import FullDoorShieldWasteBinOne from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/fullDoor/FD_Shield_waste_bin_1.webm";
import FullDoorShieldWasteBinTwo from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/fullDoor/FD_Shield_waste_bin_2.webm";
import FullDoorReplaceComponents from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/fullDoor/FD_Replace_components.png";
import FullDoorFanFilter from "../../../../assets/instruments/maintenance/sediVueDx/cleaning/fullDoor/FD_Clean_fan_filter.png";

export const SvdxCleaningStep = {
  Landing: "Landing",
  PowerDown: "PowerDown",
  PipettingWindow: "PipettingWindow",
  CartridgeHolder: "CartridgeHolder",
  CartridgeTrack: "CartridgeTrack",
  PusherArm: "PusherArm",
  OpticalWindow: "OpticalWindow",
  ShieldAndWasteBin: "ShieldAndWasteBin",
  CentrifugeArm: "CentrifugeArm",
  MoveArm: "MoveArm",
  ReplaceComponents: "ReplaceComponents",
  FanFilter: "FanFilter",
} as const;
export type SvdxCleaningStep =
  (typeof SvdxCleaningStep)[keyof typeof SvdxCleaningStep];

export function getImagesForStep(step: SvdxCleaningStep, halfDoor: boolean) {
  if (halfDoor) {
    switch (step) {
      case SvdxCleaningStep.PowerDown:
        return [HalfDoorInstrument];
      case SvdxCleaningStep.PipettingWindow:
        return [HalfDoorPipettingWindow];
      case SvdxCleaningStep.CartridgeHolder:
        return [HalfDoorCartridgeHolder];
      case SvdxCleaningStep.CartridgeTrack:
        return [HalfDoorCatridgeTrack];
      case SvdxCleaningStep.PusherArm:
        throw new Error(
          "Half-door SediVue Dx does not have a pusher arm cleaning step"
        );
      case SvdxCleaningStep.OpticalWindow:
        return [HalfDoorOpticalWindow];
      case SvdxCleaningStep.ShieldAndWasteBin:
        return [HalfDoorShieldWasteBinOne, HalfDoorShieldWasteBinTwo];
      case SvdxCleaningStep.CentrifugeArm:
        return [HalfDoorCentrifugeArm];
      case SvdxCleaningStep.MoveArm:
        return [HalfDoorMoveArm];
      case SvdxCleaningStep.ReplaceComponents:
        return [HalfDoorReplaceComponents];
      case SvdxCleaningStep.FanFilter:
        return [HalfDoorFanFilter];
    }
  } else {
    switch (step) {
      case SvdxCleaningStep.PowerDown:
        return [FullDoorInstrument];
      case SvdxCleaningStep.PipettingWindow:
        return [FullDoorPipettingWindow];
      case SvdxCleaningStep.CartridgeHolder:
        return [FullDoorCartridgeHolder];
      case SvdxCleaningStep.CartridgeTrack:
        throw new Error(
          "Full-door SediVue Dx does not have a cartridge track cleaning step"
        );
      case SvdxCleaningStep.PusherArm:
        return [FullDoorPusherArm];
      case SvdxCleaningStep.OpticalWindow:
        return [FullDoorOpticalWindow];
      case SvdxCleaningStep.ShieldAndWasteBin:
        return [FullDoorShieldWasteBinOne, FullDoorShieldWasteBinTwo];
      case SvdxCleaningStep.CentrifugeArm:
        throw new Error(
          "Full-door SediVue Dx does not have a centrifuge arm cleaning step"
        );
      case SvdxCleaningStep.MoveArm:
        return [FullDoorMoveArm];
      case SvdxCleaningStep.ReplaceComponents:
        return [FullDoorReplaceComponents];
      case SvdxCleaningStep.FanFilter:
        return [FullDoorFanFilter];
    }
  }
}
