import { Trans, useTranslation } from "react-i18next";
import { ConfirmModal } from "../../../../../components/confirm-modal/ConfirmModal";
import classNames from "classnames";
import { SpotText } from "@viewpoint/spot-react";
import { InstrumentType } from "@viewpoint/api";
import { instrumentNameForType } from "../../../../../utils/instrument-utils";

interface ExpiredQcLotModalProps {
  className?: string;
  "data-testid"?: string;

  open: boolean;
  instrumentType: InstrumentType;

  onClose: () => void;
  onConfirm: () => void;
}

function ExpiredQcLotModal(props: ExpiredQcLotModalProps) {
  const { t } = useTranslation();
  const classes = classNames("expired-qc-lot-modal", props.className);

  return (
    <ConfirmModal
      className={classes}
      data-testid={props["data-testid"]}
      open={props.open}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      headerContent={t(
        "instrumentScreens.common.qc.lotEntry.expiredModal.header",
        {
          instrumentName: instrumentNameForType(t, props.instrumentType),
        }
      )}
      bodyContent={
        <div>
          <SpotText level="paragraph">
            <Trans
              i18nKey={
                "instrumentScreens.common.qc.lotEntry.expiredModal.expiredWarning"
              }
            />
          </SpotText>

          <SpotText level="paragraph">
            <Trans
              i18nKey={
                "instrumentScreens.common.qc.lotEntry.expiredModal.expiredResults"
              }
            />
          </SpotText>
        </div>
      }
      cancelButtonContent={t("general.buttons.cancel")}
      confirmButtonContent={t("general.buttons.continue")}
    />
  );
}

export type { ExpiredQcLotModalProps };
export { ExpiredQcLotModal };
