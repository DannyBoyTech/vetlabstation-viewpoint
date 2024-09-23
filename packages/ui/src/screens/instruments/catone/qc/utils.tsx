import CatOneVetTrolDrawerImage from "../../../../assets/instruments/qc/catOne/catOne_vetTrol_drawer.png";
import CatOnePhbrDrawerImage from "../../../../assets/instruments/qc/catOne/catOne_phbr_drawer.png";
import CatOneUproDrawerImage from "../../../../assets/instruments/qc/catOne/catOne_upro_drawer.png";
import CatOneAdvancedDrawerImage from "../../../../assets/instruments/qc/catOne/catOne_advanced_drawer.png";

// case agnostic strings IVLS expects to see as substrings of QC fluid types reported by Catalyst One
export const CatOneQcFluid = {
  VetTrol: "vettrol",
  Phbr: "phbr",
  Upro: "upro",
  Advanced: "adv",
} as const;

export function getDrawerImageForQcType(qcType?: string) {
  switch (qcType) {
    case CatOneQcFluid.VetTrol:
      return CatOneVetTrolDrawerImage;
    case CatOneQcFluid.Phbr:
      return CatOnePhbrDrawerImage;
    case CatOneQcFluid.Upro:
      return CatOneUproDrawerImage;
    case CatOneQcFluid.Advanced:
      return CatOneAdvancedDrawerImage;
    default:
      throw new Error(`No drawer image for CatOne QC type: ${qcType}`);
  }
}

export function getLoadInstructionKeyForQcType(qcType?: string) {
  switch (qcType) {
    case CatOneQcFluid.VetTrol:
      return "instrumentScreens.catOne.fluidPrepWizard.vetTrol.load";
    case CatOneQcFluid.Phbr:
      return "instrumentScreens.catOne.fluidPrepWizard.phbr.load";
    case CatOneQcFluid.Upro:
      return "instrumentScreens.catOne.fluidPrepWizard.upro.load";
    case CatOneQcFluid.Advanced:
      return "instrumentScreens.catOne.fluidPrepWizard.advanced.load";
    default:
      throw new Error(`No drawer image for CatOne QC type: ${qcType}`);
  }
}

export function getWizardHeaderForQcType(qcType?: string) {
  switch (qcType) {
    case CatOneQcFluid.VetTrol:
      return "instrumentScreens.catOne.fluidPrepWizard.vetTrol.header";
    case CatOneQcFluid.Phbr:
      return "instrumentScreens.catOne.fluidPrepWizard.phbr.header";
    case CatOneQcFluid.Upro:
      return "instrumentScreens.catOne.fluidPrepWizard.upro.header";
    case CatOneQcFluid.Advanced:
      return "instrumentScreens.catOne.fluidPrepWizard.advanced.header";
    default:
      throw new Error(`No drawer image for CatOne QC type: ${qcType}`);
  }
}
