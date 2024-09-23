import { ConfirmModal } from "../../../../../components/confirm-modal/ConfirmModal";
import { useTranslation } from "react-i18next";
import { useGetSnapDevicesQuery } from "../../../../../api/SnapApi";
import { Spinner, Select } from "@viewpoint/spot-react";
import styled from "styled-components";
import { useState } from "react";
import { SnapDeviceDto } from "@viewpoint/api";

export const TestId = {
  Modal: "select-snap-device-modal",
  TestDropdown: "select-snap-device-dropdown",
};

interface SelectSnapTestModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (snapDevice: SnapDeviceDto) => void;
  speciesId: number;
}

export function SelectSnapTestModal(props: SelectSnapTestModalProps) {
  const [selectedSnapDevice, setSelectedSnapDevice] = useState<SnapDeviceDto>();
  const { t } = useTranslation();
  return (
    <ConfirmModal
      data-testid={TestId.Modal}
      open={props.open}
      onClose={props.onClose}
      onConfirm={() => props.onConfirm(selectedSnapDevice!)}
      headerContent={t("resultsEntry.snapPro.selectSnapModal.select")}
      bodyContent={
        <SelectSnapModalContent
          speciesId={props.speciesId}
          selectedSnapDevice={selectedSnapDevice}
          onDeviceSelected={(id) => setSelectedSnapDevice(id)}
        />
      }
      confirmButtonContent={t("general.buttons.next")}
      cancelButtonContent={t("general.buttons.cancel")}
      confirmable={selectedSnapDevice != null}
    />
  );
}

const ContentRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

interface SelectSnapModalContentProps {
  speciesId: number;
  selectedSnapDevice?: SnapDeviceDto;
  onDeviceSelected: (snapDevice: SnapDeviceDto) => void;
}

function SelectSnapModalContent(props: SelectSnapModalContentProps) {
  const { t } = useTranslation();
  const { data: snapDevices, isLoading } = useGetSnapDevicesQuery(
    {
      speciesId: props.speciesId,
      enabledOnly: false,
    },
    {
      selectFromResult: (res) => ({
        ...res,
        data:
          res.data == null
            ? undefined
            : [...res.data].sort((d1, d2) =>
                t(d1.displayNamePropertyKey as any).localeCompare(
                  t(d2.displayNamePropertyKey as any)
                )
              ),
      }),
    }
  );

  return (
    <ContentRoot>
      {isLoading || snapDevices == null ? (
        <Spinner size="large" />
      ) : (
        <Select
          data-testid={TestId.TestDropdown}
          value={props.selectedSnapDevice?.snapDeviceId}
          onChange={(ev) =>
            props.onDeviceSelected(
              snapDevices.find(
                (d) => `${d.snapDeviceId}` === ev.currentTarget.value
              )!
            )
          }
        >
          <Select.Option hidden>
            {t("resultsEntry.snapPro.selectSnapModal.select")}
          </Select.Option>
          {snapDevices.map((device) => (
            <Select.Option
              key={device.snapDeviceId}
              value={device.snapDeviceId}
            >
              {t(device.displayNamePropertyKey as any)}
            </Select.Option>
          ))}
        </Select>
      )}
    </ContentRoot>
  );
}
