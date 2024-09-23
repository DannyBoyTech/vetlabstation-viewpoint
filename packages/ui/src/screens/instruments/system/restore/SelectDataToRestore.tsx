import { Button, Radio, Modal, SpotText } from "@viewpoint/spot-react";
import { ModeEnum } from "@viewpoint/api";
import { Trans, useTranslation } from "react-i18next";
import React, { useState } from "react";
import { BasicModal } from "../../../../components/basic-modal/BasicModal";
import styled from "styled-components";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";

export const RadioContainer = styled.div`
  margin-top: 2em;

  label {
    margin-bottom: 4px;
  }
`;

interface SelectDataToRestoreProps {
  isFirstBoot?: boolean;
  onCancel: () => void;
  onNext: () => void;
  restoreMode: ModeEnum;
  onRestoreModeSelected: any;
}

export function SelectDataToRestore(props: SelectDataToRestoreProps) {
  const { t } = useTranslation();

  return (
    <ConfirmModal
      open={true}
      onClose={props.onCancel}
      dismissable={false}
      bodyContent={
        <>
          <SpotText level="paragraph">
            <Trans i18nKey="restore.restoreInterstitial.body" />
          </SpotText>
          <RadioContainer>
            <Radio
              checked={props.restoreMode === ModeEnum.ALL}
              label={t("restore.selectData.allAvailableData")}
              onChange={() => props.onRestoreModeSelected(ModeEnum.ALL)}
            />
            <Radio
              checked={props.restoreMode === ModeEnum.PATIENT}
              label={t("restore.selectData.patientData")}
              onChange={() => props.onRestoreModeSelected(ModeEnum.PATIENT)}
            />
            <Radio
              checked={props.restoreMode === ModeEnum.CALIBRATION}
              label={t("restore.selectData.hematologyCalibrationData")}
              onChange={() => props.onRestoreModeSelected(ModeEnum.CALIBRATION)}
            />
            <Radio
              checked={props.restoreMode === ModeEnum.SETTINGS}
              label={t("restore.selectData.userSettingsData")}
              onChange={() => props.onRestoreModeSelected(ModeEnum.SETTINGS)}
            />
          </RadioContainer>
        </>
      }
      headerContent={
        <SpotText level="h2" className="spot-modal__title">
          {t("restore.restoreInterstitial.title")}
        </SpotText>
      }
      cancelButtonContent={!props.isFirstBoot && t("general.buttons.cancel")}
      onConfirm={() => {
        if (props.restoreMode) props.onNext();
      }}
      confirmable={!!props.restoreMode}
      confirmButtonContent={
        props.isFirstBoot ? (
          <>
            <Button buttonType="secondary" onClick={props.onCancel}>
              {t("general.buttons.skip")}
            </Button>
            <Button
              onClick={() => {
                if (props.restoreMode) props.onNext();
              }}
            >
              {t("restore.buttons.restoreData")}
            </Button>
          </>
        ) : (
          t("general.buttons.next")
        )
      }
    />
  );
}
