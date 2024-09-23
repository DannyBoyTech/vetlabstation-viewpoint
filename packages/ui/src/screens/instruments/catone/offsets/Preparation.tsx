import { InstrumentStatusDto, InstrumentType } from "@viewpoint/api";
import { Button, SpotText } from "@viewpoint/spot-react";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { getInstrumentDisplayImage } from "../../../../utils/instrument-utils";
import { CatOneCleaningButton } from "../cleaning/CatOneCleaningButton";
import { VetTrolInstructionsButton } from "../qc/vettrol/VetTrolInstructionsButton";

const Root = styled.div`
  display: flex;
  gap: 50px;
  padding: 20px;
`;

const ImageColumn = styled.div`
  flex: initial;

  img {
    height: 236px;
    width: 240px;
    padding: 0;
    object-fit: cover;
    align-self: end;
  }
`;

const PrereqColumn = styled.div`
  flex: auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const Prereq = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-self: start;
`;

const PrereqLabelRoot = styled.ol`
  padding: 0 22px;
  margin: 0;
`;

interface PrereqLabelProps {
  start?: number;
  children: ReactNode;
}

function PrereqLabel(props: PrereqLabelProps) {
  return (
    <PrereqLabelRoot start={props.start}>
      <li>
        <SpotText level="paragraph">{props.children}</SpotText>
      </li>
    </PrereqLabelRoot>
  );
}

export interface PreparationProps {
  instrumentStatus: InstrumentStatusDto;
  onViewVetTrolInstructions?: () => void;
  onViewCleaningInstructions?: () => void;
}

export function Preparation(props: PreparationProps) {
  const { t } = useTranslation();
  return (
    <Root>
      <ImageColumn>
        <img
          alt={InstrumentType.CatalystOne}
          src={getInstrumentDisplayImage(InstrumentType.CatalystOne)}
        />
      </ImageColumn>
      <PrereqColumn>
        <Prereq>
          <PrereqLabel>
            {t(
              "instrumentScreens.catOne.offsetsWizard.preparation.prepareVetTrolControlFluid"
            )}
          </PrereqLabel>
          <div>
            <VetTrolInstructionsButton
              secondaryHeaderContent={t(
                "instrumentScreens.catOne.offsetsWizard.title"
              )}
              buttonType="secondary"
              buttonSize="large"
            >
              {t(
                "instrumentScreens.catOne.offsetsWizard.preparation.vetTrolInstructions"
              )}
            </VetTrolInstructionsButton>
          </div>
        </Prereq>
        <Prereq>
          <PrereqLabel start={2}>
            {t(
              "instrumentScreens.catOne.offsetsWizard.preparation.cleanYourCatOne"
            )}
          </PrereqLabel>
          <div>
            <CatOneCleaningButton
              instrumentStatus={props.instrumentStatus}
              buttonType="secondary"
              buttonSize="large"
              onClick={props.onViewCleaningInstructions}
            >
              {t(
                "instrumentScreens.catOne.offsetsWizard.preparation.cleaningInstructions"
              )}
            </CatOneCleaningButton>
          </div>
        </Prereq>
      </PrereqColumn>
    </Root>
  );
}
