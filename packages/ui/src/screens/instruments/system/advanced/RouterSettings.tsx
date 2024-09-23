import { Button, Select, SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  IPv4AddrInput,
  IPv4AddrInputProps,
} from "../../../../components/ipv4-addr-input/IPv4AddrInput";
import classNames from "classnames";
import { SpotTextProps } from "@viewpoint/spot-react/src/components/typography/Typography";
import { SelectProps } from "@viewpoint/spot-react/src/components/forms/select/Select";
import {
  IvlsRouterDto,
  IvlsWiredRouterConfigDto,
  WanIpChoiceEnum,
} from "@viewpoint/api";
import { ChangeEvent, useCallback, useMemo } from "react";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-rows: repeat(5, 40px) 60px 40px;
  grid-template-columns: 1fr 2fr;
  column-gap: 16px;
  row-gap: 8px;

  align-items: end;

  .label {
    padding-bottom: 10px;
  }

  .wan-select {
    text-align: right;

    .spot-form__select {
      display: inline-flex;
      width: 273px;
    }
  }

  .addr-input {
    text-align: right;
  }

  .buttons {
    grid-row: 7;
    grid-column: 1 / span 2;

    display: flex;
    justify-content: end;
    gap: 16px;
  }
`;

const TestId = {
  wanIp: "wan-ip-select",
  idexxDefaults: "apply-idexx-defaults",
  editRouterConfig: "edit-router-config",
} as const;

type LabelProps = Omit<SpotTextProps, "level">;

function Label(props: LabelProps) {
  const classes = classNames(props.className, "label");
  return <SpotText {...props} className={classes} level="paragraph" />;
}

interface WanSelectProps extends SelectProps {
  editing?: boolean;
  wanConfigChoices?: WanConfigChoice[];
  onWanConfigChange?: (choice: WanConfigChoice) => void;
}

function WanSelect(props: WanSelectProps) {
  const { t } = useTranslation();
  const classes = classNames(props.className, "wan-select");

  const { wanConfigChoices, onWanConfigChange } = props;
  const handleChange = useCallback(
    (ev: ChangeEvent<HTMLSelectElement>) => {
      const selection = ev?.currentTarget?.value;
      const selectionValid = wanConfigChoices?.includes(
        selection as WanConfigChoice
      );

      if (selectionValid) {
        onWanConfigChange?.(selection as WanConfigChoice);
      }
    },
    [wanConfigChoices, onWanConfigChange]
  );

  return (
    <div className={classes}>
      <Select
        data-testid={TestId.wanIp}
        value={props.value}
        disabled={!props.editing}
        onChange={handleChange}
      >
        {props.wanConfigChoices != null &&
          Array.from(props.wanConfigChoices.values()).map((choice) => (
            <Select.Option key={choice} value={choice}>
              {t(
                `instrumentScreens.system.advanced.wanIpChoice.${choice}` as any
              )}
            </Select.Option>
          ))}
      </Select>
    </div>
  );
}

function AddrInput(props: IPv4AddrInputProps) {
  return (
    <div className="addr-input">
      <IPv4AddrInput {...props} autoSelectOctets={true} />
    </div>
  );
}

interface ButtonsProps {
  className?: string;
  "data-testid"?: string;

  editing?: boolean;
  editable?: boolean;

  onClickEdit?: () => void;
  onClickApplyDefaults?: () => void;
}

function Buttons(props: ButtonsProps) {
  const { t } = useTranslation();
  const classes = classNames(props.className, "buttons");

  return (
    <div className={classes} data-testid={props["data-testid"]}>
      <Button
        data-testid={TestId.idexxDefaults}
        buttonType="secondary"
        onClick={props.onClickApplyDefaults}
        disabled={!props.editing}
      >
        {t("instrumentScreens.system.advanced.applyIDEXXDefaults")}
      </Button>
      <Button
        data-testid={TestId.editRouterConfig}
        buttonType="secondary"
        onClick={props.onClickEdit}
        disabled={!props.editable || props.editing}
      >
        {t("general.buttons.edit")}
      </Button>
    </div>
  );
}

type WanConfigChoice = `${WanIpChoiceEnum}`;

interface RouterSettingsProps {
  className?: string;
  "data-testid"?: string;

  value?: Partial<IvlsRouterDto>;
  editable?: boolean;
  editing?: boolean;

  onApplyDefaults?: () => void;
  onEdit?: () => void;
  onChange?: (changed: Partial<IvlsWiredRouterConfigDto>) => void;
}

function RouterSettings(props: RouterSettingsProps) {
  const { t } = useTranslation();

  const wanConfigChoices = useMemo(
    () =>
      props.editing
        ? Object.values(WanIpChoiceEnum).filter((it) =>
            props.value?.wanIpChoices?.includes(it)
          )
        : Object.values(WanIpChoiceEnum),
    [props.value, props.editing]
  );

  return (
    <Root>
      <SpotText className="heading" level="paragraph" bold>
        {t("instrumentScreens.system.advanced.routerConfiguration")}
      </SpotText>
      <Grid className={props.className} data-testid={props["data-testid"]}>
        <Label>{t("instrumentScreens.system.advanced.wanIpConfig")}</Label>
        <WanSelect
          value={props.value?.wanIpChoice}
          wanConfigChoices={wanConfigChoices}
          onWanConfigChange={(wanConfig) =>
            props.onChange?.({ wanIpChoice: wanConfig as WanIpChoiceEnum })
          }
          editing={props.editing}
        />
        <Label>{t("instrumentScreens.system.advanced.wanIpAddress")}</Label>
        <AddrInput
          value={props.value?.ipAddress}
          disabled={
            !props.editing ||
            props.value?.wanIpChoice === WanIpChoiceEnum.DYNAMIC
          }
          onAddrChange={(ipAddress) => props.onChange?.({ ipAddress })}
        />
        <Label>{t("instrumentScreens.system.advanced.subnetMask")}</Label>
        <AddrInput
          value={props.value?.subnetMask}
          disabled={
            !props.editing ||
            props.value?.wanIpChoice === WanIpChoiceEnum.DYNAMIC
          }
          onAddrChange={(subnetMask) => props.onChange?.({ subnetMask })}
        />
        <Label>{t("instrumentScreens.system.advanced.gateway")}</Label>
        <AddrInput
          value={props.value?.gateway}
          disabled={
            !props.editing ||
            props.value?.wanIpChoice === WanIpChoiceEnum.DYNAMIC
          }
          onAddrChange={(gateway) => props.onChange?.({ gateway })}
        />
        <Label>{t("instrumentScreens.system.advanced.dnsServer")}</Label>
        <AddrInput
          value={props.value?.primaryDnsServer}
          disabled={
            !props.editing ||
            props.value?.wanIpChoice === WanIpChoiceEnum.DYNAMIC
          }
          onAddrChange={(primaryDnsServer) =>
            props.onChange?.({ primaryDnsServer })
          }
        />
        <Label>{t("instrumentScreens.system.advanced.localIpAddress")}</Label>
        <AddrInput
          value={props.value?.localIpAddress}
          disabled={
            !props.editing ||
            props.value?.wanIpChoice === WanIpChoiceEnum.DYNAMIC
          }
          disableMask={props.editing ? 0b1101 : undefined}
          onAddrChange={(localIpAddress) =>
            props.onChange?.({ localIpAddress })
          }
        />
        <Buttons
          editable={props.editable}
          editing={props.editing}
          onClickEdit={props.onEdit}
          onClickApplyDefaults={props.onApplyDefaults}
        />
      </Grid>
    </Root>
  );
}

export { RouterSettings };
