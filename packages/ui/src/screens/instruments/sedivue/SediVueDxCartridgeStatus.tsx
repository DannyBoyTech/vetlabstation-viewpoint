import styled from "styled-components";
import { LevelGauge } from "../../../components/level-gauge/LevelGauge";
import { Theme } from "../../../utils/StyleConstants";
import { Link, SpotText } from "@viewpoint/spot-react";
import { Trans, useTranslation } from "react-i18next";
import { InlineText } from "../../../components/typography/InlineText";
import {
  useFormatDate,
  useFormatDateTime12h,
} from "../../../utils/hooks/datetime";

const Root = styled.div`
  .title {
    margin-bottom: 13px;
  }

  .card {
    display: inline-flex;
    flex-basis: 50px;

    gap: 25px;

    min-width: 275px;
    max-width: 420px;

    border: ${(p: { theme: Theme }) => p.theme.borders?.lightSecondary};
    border-radius: 4px;
    padding: 26px;
  }

  .gauge {
    flex: initial;
  }

  .info {
    flex: auto;

    display: flex;
    flex-direction: column;

    gap: 10px;

    a {
      margin: 19px 0px;
    }
  }
`;

interface SediVueDxCartridgeStatusProps {
  "data-testid"?: string;

  numberRemaining?: number;
  percentRemaining?: number;

  lotNumber?: string;
  expirationDate?: Date;
  installationDate?: Date;

  allowReplaceCartridge?: boolean;
  onReplaceCartridge?: () => void;
}

const transComponents = {
  strong: <InlineText level="paragraph" bold />,
};

function SediVueDxCartridgeStatus(props: SediVueDxCartridgeStatusProps) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const formatDateTime12h = useFormatDateTime12h();

  const handleReplaceCartridge = () => props.onReplaceCartridge?.();

  return (
    <Root>
      <SpotText className="title" level="h4">
        {t("instrumentScreens.sediVueDx.cartridgeStatus.title")}
      </SpotText>
      <div className="card">
        <LevelGauge
          className="gauge"
          percentFull={props.percentRemaining}
          data-testid={TestId.Gauge}
        />
        <div className="info">
          <SpotText level="paragraph" bold data-testid={TestId.Remaining}>
            {t("instrumentScreens.sediVueDx.cartridgeStatus.remaining", {
              remaining:
                props.numberRemaining != null
                  ? props.numberRemaining
                  : t("general.placeholder.noValue"),
            })}
          </SpotText>
          <Link
            onClick={handleReplaceCartridge}
            data-testid={TestId.ReplaceCartButton}
            disabled={!props.allowReplaceCartridge}
          >
            {t("instrumentScreens.sediVueDx.cartridgeStatus.replaceCartridges")}
          </Link>
          <SpotText level="paragraph" data-testid={TestId.LotNumber}>
            <Trans
              i18nKey="instrumentScreens.sediVueDx.cartridgeStatus.lotNumber"
              components={transComponents}
              values={{
                lotNumber:
                  props.lotNumber != null
                    ? props.lotNumber
                    : t("general.placeholder.noValue"),
              }}
            />
          </SpotText>
          <SpotText level="paragraph" data-testid={TestId.ExpireDate}>
            <Trans
              i18nKey="instrumentScreens.sediVueDx.cartridgeStatus.expirationDate"
              components={transComponents}
              values={{
                date:
                  props.expirationDate != null
                    ? formatDate(props.expirationDate)
                    : t("general.placeholder.noValue"),
              }}
            />
          </SpotText>
          <SpotText level="paragraph" data-testid={TestId.InstallDate}>
            <Trans
              i18nKey="instrumentScreens.sediVueDx.cartridgeStatus.installed"
              components={transComponents}
              values={{
                date:
                  props.installationDate != null
                    ? formatDateTime12h(props.installationDate)
                    : t("general.placeholder.noValue"),
              }}
            />
          </SpotText>
        </div>
      </div>
    </Root>
  );
}

const TestId = {
  Gauge: "svdx-cart-status-gauge",
  Remaining: "svdx-cart-status-remaining",
  ReplaceCartButton: "svdx-cart-status-replace-cart-button",
  LotNumber: "svdx-cart-status-lot-number",
  InstallDate: "svdx-cart-status-install-date",
  ExpireDate: "svdx-cart-status-expire-date",
} as const;

//exported for test only
export { TestId };

export type { SediVueDxCartridgeStatusProps };
export { SediVueDxCartridgeStatus };
