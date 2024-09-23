import {
  MatchSuggestionDto,
  MatchTypes,
  PendingPimsRequestMatchDto,
} from "@viewpoint/api";
import { Modal, Button, SpotText } from "@viewpoint/spot-react";
import { BasicModal } from "../../../components/basic-modal/BasicModal";
import { Trans, useTranslation } from "react-i18next";
import { PropsWithChildren, useState } from "react";
import styled from "styled-components";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { ResponsiveModalWrapper } from "../../../components/modal/ResponsiveModalWrapper";
import { Theme } from "../../../utils/StyleConstants";
import { getAgeString } from "../../../utils/date-utils";
import classNames from "classnames";
import SpinnerOverlay from "../../../components/overlay/SpinnerOverlay";

export interface PatientMatchModalProps {
  open: boolean;
  matchResponse: PendingPimsRequestMatchDto;

  onMatch: (matchSuggestion: MatchSuggestionDto) => void;
  onCreateNew: () => void;
  onClose: () => void;
}

export function PatientMatchModal(props: PatientMatchModalProps) {
  const { t } = useTranslation();
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [confirmingMatch, setConfirmingMatch] = useState(false);

  if (confirmingMatch) {
    return (
      <BasicModal
        open={props.open}
        onClose={props.onClose}
        headerContent={
          <SpotText level="h3" className="spot-modal__title">
            {t("home.patientMatch.confirmation.title")}
          </SpotText>
        }
        bodyContent={
          <SpotText level="paragraph">
            <Trans
              i18nKey={"home.patientMatch.confirmation.body"}
              components={CommonTransComponents}
            />
          </SpotText>
        }
        footerContent={
          <>
            <Modal.FooterCancelButton onClick={props.onClose}>
              {t("general.buttons.cancel")}
            </Modal.FooterCancelButton>

            <Button buttonType="secondary" onClick={props.onCreateNew}>
              {t("home.patientMatch.buttons.createNew")}
            </Button>
            <Button
              onClick={() =>
                props.onMatch(
                  props.matchResponse.matchSuggestions[currentSuggestionIndex]
                )
              }
            >
              {t("home.patientMatch.buttons.match")}
            </Button>
          </>
        }
      />
    );
  }

  return (
    <ResponsiveModalWrapper>
      <BasicModal
        open={props.open}
        onClose={props.onClose}
        headerContent={
          <SpotText level="h3" className="spot-modal__title">
            {t("home.patientMatch.title")}
          </SpotText>
        }
        bodyContent={
          <PatientMatchContent
            matchResponse={props.matchResponse}
            currentSuggestionIndex={currentSuggestionIndex}
            onNextSuggestion={() =>
              setCurrentSuggestionIndex(
                currentSuggestionIndex + 1 >=
                  props.matchResponse.matchSuggestions.length
                  ? 0
                  : currentSuggestionIndex + 1
              )
            }
          />
        }
        footerContent={
          <>
            <Modal.FooterCancelButton onClick={props.onClose}>
              {t("general.buttons.cancel")}
            </Modal.FooterCancelButton>

            <Button buttonType="secondary" onClick={props.onCreateNew}>
              {t("home.patientMatch.buttons.createNew")}
            </Button>
            <Button onClick={() => setConfirmingMatch(true)}>
              {t("home.patientMatch.buttons.match")}
            </Button>
          </>
        }
      />
    </ResponsiveModalWrapper>
  );
}

const SLIDE_DURATION_MS = 200;

const ContentRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
`;

const GridWrapper = styled.div`
  position: relative;
`;

const GrayBackground = styled.div`
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.secondary};
  position: absolute;
  border-radius: 5px;
  left: 22%;
  top: 0;
  bottom: 0;
  right: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 2fr;
  padding: 24px;
  width: 650px;

  .grid-item {
    overflow: hidden;

    > .spot-typography__text--body {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .grid-item:nth-child(3n) {
    background-color: ${(p: { theme: Theme }) =>
      p.theme.colors?.background?.primary};
    border-left: ${(p: { theme: Theme }) => p.theme.borders?.controlFocus};
    border-right: ${(p: { theme: Theme }) => p.theme.borders?.controlFocus};

    transition: all ${SLIDE_DURATION_MS}ms ease-in-out;

    &.changing {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .grid-item:nth-child(3) {
    border-top: ${(p: { theme: Theme }) => p.theme.borders?.controlFocus};
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  .grid-item:nth-child(24) {
    border-bottom: ${(p: { theme: Theme }) => p.theme.borders?.controlFocus};
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
`;

const NextButton = styled.div`
  position: absolute;
  right: 5px;
  top: 55%;
  bottom: 45%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface PatientMatchContentProps {
  matchResponse: PendingPimsRequestMatchDto;
  currentSuggestionIndex: number;
  onNextSuggestion: () => void;
}

function PatientMatchContent(props: PatientMatchContentProps) {
  const [animateSlide, setAnimateSlide] = useState(false);
  const { t } = useTranslation();
  const currentSuggestion =
    props.matchResponse.matchSuggestions[props.currentSuggestionIndex];
  const pimsRequest = props.matchResponse.pimsRequestDto;

  const handleNext = () => {
    setAnimateSlide(true);
    const timeout = setTimeout(() => {
      props.onNextSuggestion();
      setAnimateSlide(false);
    }, SLIDE_DURATION_MS);

    return () => {
      clearTimeout(timeout);
    };
  };

  return (
    <ContentRoot>
      <div>
        <Trans
          i18nKey={"home.patientMatch.instructions"}
          components={CommonTransComponents}
        />
      </div>

      <GridWrapper>
        <GrayBackground />
        <Grid>
          <div />
          <Cell changing={animateSlide}>
            <SpotText level="paragraph" bold>
              {t("home.patientMatch.currentRecord")}
            </SpotText>
          </Cell>
          <Cell changing={animateSlide}>
            <SpotText level="paragraph" bold>
              {t("home.patientMatch.suggestedMatch", {
                matchNumber: props.currentSuggestionIndex + 1,
                totalMatches: props.matchResponse.matchSuggestions.length,
              })}
            </SpotText>
          </Cell>

          <Cell changing={animateSlide}>
            <SpotText level="secondary">
              {t("home.patientMatch.table.patient")}
            </SpotText>
          </Cell>

          <Cell changing={animateSlide} bordered>
            <SpotText level="paragraph">{pimsRequest.patientName}</SpotText>
          </Cell>

          <Cell
            changing={animateSlide}
            bordered
            mismatched={isMismatched(
              currentSuggestion.comparisonMap,
              "patient"
            )}
          >
            <SpotText level="paragraph">
              {currentSuggestion.patientDto.patientName}
            </SpotText>
          </Cell>

          <Cell changing={animateSlide}>
            <SpotText level="secondary">
              {t("home.patientMatch.table.species")}
            </SpotText>
          </Cell>

          <Cell changing={animateSlide} bordered>
            <SpotText level="paragraph">
              {t(`Species.${pimsRequest.patientSpecies.speciesName}`)}
            </SpotText>
          </Cell>

          <Cell
            changing={animateSlide}
            bordered
            mismatched={isMismatched(
              currentSuggestion.comparisonMap,
              "species"
            )}
          >
            <SpotText level="paragraph">
              {t(
                `Species.${currentSuggestion.patientDto.speciesDto.speciesName}`
              )}
            </SpotText>
          </Cell>

          <Cell changing={animateSlide}>
            <SpotText level="secondary">
              {t("home.patientMatch.table.breed")}
            </SpotText>
          </Cell>

          <Cell changing={animateSlide} bordered>
            <SpotText level="paragraph">
              {pimsRequest.patientBreed?.breedName ??
                t("general.placeholder.noValue")}
            </SpotText>
          </Cell>

          <Cell
            changing={animateSlide}
            bordered
            mismatched={isMismatched(currentSuggestion.comparisonMap, "breed")}
          >
            <SpotText level="paragraph">
              {currentSuggestion.patientDto.breedDto?.breedName ??
                t("general.placeholder.noValue")}
            </SpotText>
          </Cell>

          <Cell changing={animateSlide}>
            <SpotText level="secondary">
              {t("home.patientMatch.table.sex")}
            </SpotText>
          </Cell>

          <Cell changing={animateSlide} bordered>
            <SpotText level="paragraph">
              {t(
                `gender.${pimsRequest.patientGender?.genderName}` as any,
                t("general.placeholder.noValue")
              )}
            </SpotText>
          </Cell>

          <Cell
            changing={animateSlide}
            bordered
            mismatched={isMismatched(currentSuggestion.comparisonMap, "gender")}
          >
            <SpotText level="paragraph">
              {t(
                `gender.${currentSuggestion.patientDto.genderDto?.genderName}` as any,
                t("general.placeholder.noValue")
              )}
            </SpotText>
          </Cell>

          <Cell changing={animateSlide}>
            <SpotText level="secondary">
              {t("home.patientMatch.table.age")}
            </SpotText>
          </Cell>

          <Cell changing={animateSlide} bordered>
            <SpotText level="paragraph">
              {pimsRequest.patientDob == null
                ? t("general.placeholder.noValue")
                : getAgeString(pimsRequest.patientDob)}
            </SpotText>
          </Cell>

          <Cell
            changing={animateSlide}
            bordered
            mismatched={isMismatched(currentSuggestion.comparisonMap, "age")}
          >
            <SpotText level="paragraph">
              {currentSuggestion.patientDto.birthDate == null
                ? t("general.placeholder.noValue")
                : getAgeString(currentSuggestion.patientDto.birthDate)}
            </SpotText>
          </Cell>

          <Cell changing={animateSlide}>
            <SpotText level="secondary">
              {t("home.patientMatch.table.clientFirst")}
            </SpotText>
          </Cell>

          <Cell changing={animateSlide} bordered>
            <SpotText level="paragraph">
              {pimsRequest.clientFirstName ?? t("general.placeholder.noValue")}
            </SpotText>
          </Cell>

          <Cell
            changing={animateSlide}
            bordered
            mismatched={isMismatched(
              currentSuggestion.comparisonMap,
              "clientFirstName"
            )}
          >
            <SpotText level="paragraph">
              {currentSuggestion.patientDto.clientDto?.firstName ??
                t("general.placeholder.noValue")}
            </SpotText>
          </Cell>

          <Cell changing={animateSlide}>
            <SpotText level="secondary">
              {t("home.patientMatch.table.clientLast")}
            </SpotText>
          </Cell>

          <Cell changing={animateSlide}>
            <SpotText level="paragraph">
              {pimsRequest.clientLastName ?? t("general.placeholder.noValue")}
            </SpotText>
          </Cell>

          <Cell
            changing={animateSlide}
            mismatched={isMismatched(
              currentSuggestion.comparisonMap,
              "clientLastName"
            )}
          >
            <SpotText level="paragraph">
              {currentSuggestion.patientDto.clientDto?.lastName ??
                t("general.placeholder.noValue")}
            </SpotText>
          </Cell>
        </Grid>
        {props.matchResponse.matchSuggestions.length > 1 && (
          <NextButton onClick={handleNext}>
            <Button
              iconOnly
              leftIcon="next"
              buttonSize="large"
              onClick={handleNext}
            />
          </NextButton>
        )}
      </GridWrapper>
    </ContentRoot>
  );
}

const CellRoot = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 24px;

  &.mismatched {
    .spot-typography__text--body {
      color: ${(p) => p.theme.colors?.feedback?.error};
      font-weight: bold;
    }
  }
`;

const CellBorder = styled.div`
  position: absolute;
  width: 80%;
  bottom: 0;
  border-bottom: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
`;

interface CellProps extends PropsWithChildren {
  bordered?: boolean;
  mismatched?: boolean;
  changing?: boolean;
}

function Cell(props: CellProps) {
  const classes = classNames("grid-item", {
    mismatched: props.mismatched,
    changing: props.changing,
  });
  return (
    <CellRoot className={classes}>
      {props.bordered && <CellBorder />}
      {props.children}
    </CellRoot>
  );
}

const c = {
  clientLastName: {
    Washington: true,
  },
  gender: {
    Female: true,
  },
  species: {
    Canine: true,
  },
  patient: {
    Benjo: false,
  },
  clientFirstName: {
    Ingrid: true,
  },
  age: {
    "2022-03-13": true,
  },
};

/**
 * Shape of IVLS comparison map is:
 *
 * comparisonMap: {
 *   patient: {
 *     [patientDto.patientName]: true/false,
 *   },
 *   species: {
 *     [patientDto.speciesDto.speciesName]: true/false,
 *   },
 *   breed: {
 *     [patientDto.breedDto.breedName]: true/false,
 *   },
 *   gender: {
 *     [patientDto.genderDto.genderName]: true/false,
 *   },
 *   age: {
 *     [patientDto.birthDate]: true/false,
 *   },
 *   clientFirstName: {
 *     [patientDto.clientDto.firstName]: true/false,
 *   },
 *   clientLastName: {
 *     [patientDto.clientDto.lastName]: true/false,
 *   },
 * }
 *
 * The "patientDto" used to create the key names is the suggested match patient.
 * If the value of the property is true, then it is a match with the provided
 * patient information. If the value is false, that indicates that the field
 * is mismatched.
 */
function isMismatched(
  comparisonMap: Record<MatchTypes, Record<string, boolean>>,
  type: MatchTypes
): boolean {
  return (
    comparisonMap[type] != null &&
    Object.values(comparisonMap[type]).some((v) => !v)
  );
}
