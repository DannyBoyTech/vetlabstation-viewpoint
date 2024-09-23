import React, { MouseEventHandler, ReactElement, ReactNode } from "react";
import { PatientImage } from "./PatientImage";
import { PatientDisplay } from "./PatientDisplay";
import { PatientDetail } from "./PatientDetail";
import { PatientName } from "./PatientName";
import styled from "styled-components";
import classNames from "classnames";
import { SpotIconName } from "@viewpoint/spot-icons/src/components/spot-icon/SpotIcon";

export interface SpotPatient {
  name?: string;
  speciesName?: string;
  breed?: string;
  age?: string;
  patientId?: string;
  gender?: string;
}

export interface SpotClient {
  familyName?: string;
  givenName?: string;
  clientId?: string;
}

export interface PatientSignalmentProps {
  patient?: SpotPatient;
  additionalPatientDetail?: ReactNode;
  client?: SpotClient;
  size?: "xs" | "small" | "medium" | "large";
  allowPhotoUpload?: boolean;
  photoUrl?: string;
  onClickPatient?: MouseEventHandler;
  onClickImage?: MouseEventHandler;
  className?: string;
  customInfo?: ReactElement;
  patientIdOnNewLine?: boolean;
  iconName?: SpotIconName;
  hideIcon?: boolean;
}

const PatientSignalment = ({
  className,
  patient,
  additionalPatientDetail,
  client,
  size,
  allowPhotoUpload,
  photoUrl,
  onClickImage,
  onClickPatient,
  customInfo,
  patientIdOnNewLine,
  iconName,
  hideIcon,
}: PatientSignalmentProps) => {
  const showDetail =
    !customInfo && size !== "xs" && (patient || additionalPatientDetail);

  const displayTitleClasses = classNames("spot-patient-display__title", {
    "spot-patient-display__title-newline": patientIdOnNewLine,
  });

  return (
    <PatientDisplay className={className} size={size ?? "large"}>
      {!hideIcon && (
        <PatientImage
          species={patient?.speciesName}
          allowPhotoUpload={allowPhotoUpload}
          photoUrl={photoUrl}
          onClick={onClickImage}
          iconName={iconName}
        />
      )}
      <div className="spot-patient-display__patient-info">
        <div className={displayTitleClasses}>
          <PatientName onClick={onClickPatient}>
            {patient?.name} {client?.familyName}
          </PatientName>
          {patient?.patientId && (
            <span className="spot-patient-display__account">
              {patient?.patientId}
            </span>
          )}
        </div>
        {customInfo ??
          (showDetail && (
            <PatientDetail
              detail={patient}
              additionalDetail={additionalPatientDetail}
            />
          ))}
      </div>
    </PatientDisplay>
  );
};

const StyledPatientSignalment: typeof PatientSignalment = styled(
  PatientSignalment
)`
  /* specificity bump to override spot */

  & .clickable {
    cursor: pointer;
  }

  /* vv use ellipsis when patient name overflows vv */
  .spot-patient-display__patient-info {
    overflow-x: clip;
  }

  .spot-patient-display__title {
    display: flex;
    align-items: flex-end;
    overflow-x: clip;
  }

  .spot-patient-display__title-newline {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;

    .spot-patient-display__pet-name,
    .spot-patient-display__account {
      width: 100%;
      text-overflow: ellipsis;
      overflow-x: clip;
    }
  }

  .spot-patient-display__pet-name,
  .spot-patient-display__account {
    text-overflow: ellipsis;
    overflow-x: clip;
  }

  .spot-patient-display__pet-info {
    align-items: center;
  }

  overflow-x: hidden;
  white-space: nowrap;
  /* ^^ allow using ellipsis when the patient name tries to overflow the container ^^ */
`;

export default StyledPatientSignalment as typeof PatientSignalment;
