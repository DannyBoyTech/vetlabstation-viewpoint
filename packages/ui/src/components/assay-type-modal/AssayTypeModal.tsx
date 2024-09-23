import { useEffect, useState } from "react";
import { Select, SpotText } from "@viewpoint/spot-react";
import { ConfirmModal } from "../confirm-modal/ConfirmModal";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

interface AssayTypeModalOption {
  key: string;
  value: string;
}

interface AssayTypeModalProps {
  open: boolean;
  dismissable?: boolean;
  onClose: () => void;
  onConfirm: (value: any) => void;

  categoryKey: string;
  patientName: string;
  speciesKey: string;
  options: AssayTypeModalOption[];
}

const PromptText = styled(SpotText)`
  margin: 0 0 4px 2px;
`;

const AssayTypeModal = ({
  dismissable = false,
  ...props
}: AssayTypeModalProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>();
  const [confirmable, setConfirmable] = useState(false);

  useEffect(() => {
    setConfirmable(!!value);
  }, [value]);

  return (
    <ConfirmModal
      dismissable={dismissable}
      onClose={props.onClose}
      confirmable={confirmable}
      onConfirm={() => {
        props.onConfirm(value);
      }}
      open={props.open}
      headerContent={
        <>
          <SpotText level="h4" className="spot-patient-display__pet-name">{`${
            props.patientName
          } | ${t(props.speciesKey as any)}`}</SpotText>
          <SpotText level="h2">
            {t(("assayTypeModal." + props.categoryKey) as any)}
          </SpotText>
        </>
      }
      bodyContent={
        <>
          <PromptText level="paragraph">
            {t("assayTypeModal.resultsPendingUntilIdentified")}
          </PromptText>

          <Select
            data-testid="select-test-type"
            value={value}
            onChange={(ev) => setValue(ev.currentTarget.value)}
          >
            <Select.Option key={""} value="">
              {t("assayTypeModal.selectOne")}
            </Select.Option>
            {props.options.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {t(("assayTypeModal." + option.key) as any)}
              </Select.Option>
            ))}
          </Select>
        </>
      }
      cancelButtonContent={t("assayTypeModal.later")}
      confirmButtonContent={t("assayTypeModal.done")}
    />
  );
};

export type { AssayTypeModalProps, AssayTypeModalOption };

export { AssayTypeModal };
