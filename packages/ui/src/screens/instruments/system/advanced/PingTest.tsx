import { Button, SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { InlineText } from "../../../../components/typography/InlineText";
import { IPv4AddrInput } from "../../../../components/ipv4-addr-input/IPv4AddrInput";
import { useMemo, useState } from "react";
import styled from "styled-components";
import classNames from "classnames";
import { useLazyPingQuery } from "../../../../api/SystemInfoApi";
import { useInfoModal } from "../../../../components/global-modals/components/GlobalInfoModal";
import { validIPv4String } from "../../../../utils/ipv4-utils";
const Root = styled.div`
  display: flex;
  gap: 20px;
  flex-direction: column;

  .ping-test__title {
    flex: 1;
  }

  .ping-test__label {
    flex: none;
    display: flex;
    align-items: center;
  }

  .ping-test__ip {
    vertical-align: top;
  }

  .ping-test__addr-container {
    flex: 1;
    display: flex;
    justify-content: space-between;
  }

  .ping-test__button-container {
    flex: 1;
    text-align: right;
  }
`;

interface PingTestProps {
  className?: string;
  "data-testid"?: string;
}

function PingTest(props: PingTestProps) {
  const { t } = useTranslation();
  const [ip, setIp] = useState<string>();
  const [ping, { isFetching: pingInProgress }] = useLazyPingQuery();
  const { addInfoModal } = useInfoModal();

  const classes = classNames(props.className, "ping-test");

  const validIp = useMemo(() => validIPv4String(ip), [ip]);

  const TestId = {
    ipInput: "ping-ip-address",
    pingIp: "ping-ip-button",
  } as const;

  async function pingAndReport() {
    let success = false;

    try {
      if (ip) success = await ping(ip, false).unwrap();
    } catch (e) {}

    addInfoModal({
      header: t("instrumentScreens.system.advanced.pingModal.title"),
      content: t("instrumentScreens.system.advanced.pingModal.resultMessage", {
        ip: ip,
        result: t(
          `instrumentScreens.system.advanced.pingModal.${
            success ? "success" : "failure"
          }`
        ),
      }),
    });
  }

  return (
    <Root className={classes} data-testid={props["data-testid"]}>
      <SpotText className="ping-test__title" level="paragraph" bold>
        {t("instrumentScreens.system.advanced.networkAccessTest")}
      </SpotText>
      <div className="ping-test__addr-container">
        <InlineText className="ping-test__label" level="paragraph">
          {t("instrumentScreens.system.advanced.networkIpAddress")}
        </InlineText>
        <IPv4AddrInput
          data-testid={TestId.ipInput}
          className="ping-test__ip"
          value={ip}
          onAddrChange={setIp}
          autoSelectOctets={true}
        />
      </div>
      <div className="ping-test__button-container">
        <Button
          data-testid={TestId.pingIp}
          buttonType="secondary"
          disabled={!validIp || pingInProgress}
          onClick={pingAndReport}
        >
          {t("instrumentScreens.system.advanced.ping")}
        </Button>
      </div>
    </Root>
  );
}

export { PingTest };
