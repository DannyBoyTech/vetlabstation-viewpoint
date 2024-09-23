import { Radio, RadioGroup, SpotText } from "@viewpoint/spot-react";
import styled from "styled-components";
import { BarcodeType, InstrumentStatusDto } from "@viewpoint/api";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

const Root = styled.div`
  display: flex;
  gap: 20px;
`;

const LeftSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RadioContainer = styled.div`
  margin-left: 5px;
`;

const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
`;

const KeyboardContainer = styled.div`
  flex: 1;
`;

const ImageContainer = styled.div`
  flex: 3;
  text-align: center;
`;

const StyledImage = styled.img`
  object-fit: contain;
  margin: auto;
  max-width: 100%;
`;

export const TestId = {
  NextButton: "lot-entry-next-button",
  CancelButton: "lot-entry-cancel-button",
  ConsumableTypeRadio: (type: BarcodeType) => `lot-consumable-radio-${type}`,
  labelImage: "lot-entry-image",
} as const;

export interface LotEntryProps {
  instrument: InstrumentStatusDto;
  barcodeTypes: BarcodeType[];
  barcodeType?: BarcodeType;
  onBarcodeTypeChanged: (type: BarcodeType) => void;
  exampleImageSrc?: string;
  inputElem: ReactNode;
  keyboardElem?: ReactNode;
}

export function LotEntry(props: LotEntryProps) {
  const { t } = useTranslation();

  return (
    <Root>
      <LeftSection>
        <InputsContainer>
          <SpotText level="paragraph" bold>
            {t("instrumentScreens.lotEntry.selectType")}
          </SpotText>
          <RadioContainer>
            <RadioGroup>
              {props.barcodeTypes?.map((type) => (
                <Radio
                  key={type}
                  data-testid={TestId.ConsumableTypeRadio(type)}
                  label={t(`barcodeType.${type}`)}
                  checked={props.barcodeType === type}
                  onChange={() => props.onBarcodeTypeChanged(type)}
                />
              ))}
            </RadioGroup>
          </RadioContainer>

          <SpotText level="paragraph" bold>
            {t("instrumentScreens.lotEntry.enter")}
          </SpotText>

          {props.inputElem}
        </InputsContainer>

        <KeyboardContainer>{props.keyboardElem}</KeyboardContainer>
      </LeftSection>

      <ImageContainer>
        {props.exampleImageSrc == null ? (
          <></>
        ) : (
          <StyledImage
            data-testid={TestId.labelImage}
            src={props.exampleImageSrc}
            alt="lot-entry-example"
          />
        )}
      </ImageContainer>
    </Root>
  );
}
