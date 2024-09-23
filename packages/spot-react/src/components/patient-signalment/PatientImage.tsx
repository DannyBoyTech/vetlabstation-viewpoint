import React, { MouseEventHandler } from "react";
import { SpotIcon } from "@viewpoint/spot-icons";
import classnames from "classnames";
import { SpotIconName } from "@viewpoint/spot-icons/src/components/spot-icon/SpotIcon";

const IconSpecies = ["canine", "feline", "equine"];

export const getSpeciesIconName = (species?: string) => {
  const lcSpecies = species?.toLowerCase();
  return (
    lcSpecies && IconSpecies.includes(lcSpecies)
      ? `animal-${lcSpecies}`
      : "animal-other"
  ) as SpotIconName;
};

export interface PatientImageProps {
  className?: string;
  allowPhotoUpload?: boolean;
  photoUrl?: string;
  species?: string;
  onClick?: MouseEventHandler;
  iconName?: SpotIconName;
}

export const PatientImage = ({
  className,
  allowPhotoUpload,
  photoUrl,
  species,
  onClick,
  iconName,
}: PatientImageProps) => {
  const wrapperClasses = classnames(
    {
      "spot-patient-display__icon": true,
      clickable: allowPhotoUpload,
    },
    className
  );

  const avatarClasses = classnames({
    "spot-patient-display__avatar": true,
    "spot-patient-display__avatar--pet": photoUrl,
    "spot-patient-display__avatar--none": !photoUrl && allowPhotoUpload,
    "spot-patient-display__avatar--na": !photoUrl && !allowPhotoUpload,
  });

  const avatarImageClasses = classnames({
    "spot-patient-display__img": photoUrl,
  });

  return (
    <div className={wrapperClasses} onClick={onClick}>
      <div className={avatarClasses}>
        {photoUrl ? (
          <img src={photoUrl} alt={photoUrl} className={avatarImageClasses} />
        ) : (
          <svg
            className="spot-icon spot-patient-display__svg"
            aria-labelledby="title"
          >
            <title>{species}</title>
            <SpotIcon
              name={iconName ?? (getSpeciesIconName(species) as SpotIconName)}
            />
          </svg>
        )}
      </div>
      {allowPhotoUpload && (
        <div className="spot-patient-display__camera">
          <SpotIcon name="camera" />
        </div>
      )}
    </div>
  );
};
