import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import styled from "styled-components";

import { Button, DataTable, Label, SpotText } from "@viewpoint/spot-react";
import { Theme } from "../../../utils/StyleConstants";
import {
  SettingsPageRoot,
  SettingsPageContent,
} from "../common-settings-components";
import SpinnerOverlay from "../../../components/overlay/SpinnerOverlay";
import { useConfirmModal } from "../../../components/global-modals/components/GlobalConfirmModal";
import {
  useDeleteDoctorMutation,
  useGetDoctorsQuery,
} from "../../../api/DoctorApi";
import { DoctorDto } from "../../../../../api/dist/types";
import { useGetSettingQuery } from "../../../api/SettingsApi";
import { SettingTypeEnum } from "@viewpoint/api";

import { useFormatPersonalName } from "../../../utils/hooks/LocalizationHooks";

const Root = styled(SettingsPageRoot)`
  position: relative;
  flex-direction: column;
`;

const OverviewSection = styled(SettingsPageContent)`
  margin-bottom: 0;
  flex: none;
`;

const OverviewBody = styled.div`
  margin-top: 30px;
`;

const AccountNumberButton = styled(Button)`
  padding-left: 0;
`;

const StyledLabel = styled(Label)`
  font-weight: bold;
  margin-bottom: 0;
`;

const DataTableSection = styled(SettingsPageContent)`
  padding: 0;
  overflow-y: auto;

  table {
    margin: 0;
    width: 100%;

    thead {
      display: none;
    }

    tbody {
      tr > td {
        word-break: break-all;
      }
    }
  }
`;

const DataTableHeaderWrapper = styled.div`
  padding: 16px 0rem 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  background-color: inherit;
  top: 0;
  border-bottom: ${(p: { theme: Theme }) => p.theme.borders?.heavyPrimary};
`;

const DataTableButtonConatiner = styled.div`
  display: flex;
`;

function noOp() {}

function compareDoctor(docOne: DoctorDto, docTwo: DoctorDto) {
  // Intentionally matching the historical sorting behavior -- if the last name is missing, it should be sorted to the top.
  return (docOne.lastName ?? "").localeCompare(docTwo.lastName ?? "");
}

export function PracticeInfo() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { addConfirmModal } = useConfirmModal();
  const [deleteDoctor] = useDeleteDoctorMutation();

  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDto | undefined>();
  const formatName = useFormatPersonalName();

  const { data, isLoading } = useGetDoctorsQuery(undefined, {
    selectFromResult: (res) => ({
      ...res,
      data: res.data
        ?.map((doctor) => ({
          ...doctor,
          displayName: formatName(doctor),
        }))
        .sort(compareDoctor),
    }),
  });

  const { data: accountNumber, isLoading: accountNumberLoading } =
    useGetSettingQuery(SettingTypeEnum.SAP_REFERENCE_NUMBER);

  const columns = [
    {
      Header: "",
      accessor: "displayName",
    },
  ];

  const handleEditAccountNumber = () =>
    nav(`account_number/edit?accountNumber=${accountNumber ?? ""}`);

  const handleAddDoctor = () => nav("add");

  const handleEditDoctor = () =>
    nav(
      `${selectedDoctor?.id}/edit?firstName=${selectedDoctor?.firstName}&lastName=${selectedDoctor?.lastName}`
    );

  const handleDeleteDoctor = () => {
    addConfirmModal({
      headerContent: t("settings.practiceInfo.confirmDeleteDoctor.header"),
      bodyContent: (
        <div>{t("settings.practiceInfo.confirmDeleteDoctor.body")}</div>
      ),
      "data-testid": TestId.confirmDeleteDoctorModal,
      cancelButtonContent: t("general.buttons.cancel"),
      confirmButtonContent: t("general.buttons.delete"),
      onClose: noOp,
      onConfirm: () => {
        deleteDoctor({ doctorId: selectedDoctor?.id as number }).unwrap();
      },
    });
  };

  const TestId = {
    practiceInfoMain: "practice-info-main",
    accountNumberButton: "account-number-button",
    addDoctorButton: "add-doctor-button",
    editDoctorButton: "edit-doctor-button",
    deleteDoctorButton: "delete-doctor-button",
    confirmDeleteDoctorModal: "confirm-delete-doctor-modal",
  } as const;

  return (
    <Root data-testid={TestId.practiceInfoMain}>
      {(accountNumberLoading || isLoading) && <SpinnerOverlay />}
      <OverviewSection>
        <SpotText level="h3">
          {t("settings.practiceInfo.labels.practiceInfo")}
        </SpotText>
        <OverviewBody>
          <StyledLabel>
            {t("settings.practiceInfo.labels.idexxAccountNumber")}
          </StyledLabel>
          <div>
            <AccountNumberButton
              data-testid={TestId.accountNumberButton}
              buttonType="link"
              rightIcon="edit"
              onClick={handleEditAccountNumber}
            >
              {accountNumber}
            </AccountNumberButton>
          </div>
        </OverviewBody>
      </OverviewSection>
      <DataTableSection>
        <DataTableHeaderWrapper>
          <StyledLabel>{t("settings.practiceInfo.labels.doctor")}</StyledLabel>
          <DataTableButtonConatiner>
            <Button
              data-testid={TestId.addDoctorButton}
              buttonType="link"
              leftIcon="add-a-user"
              onClick={handleAddDoctor}
            >
              {t("general.buttons.new")}
            </Button>
            <Button
              data-testid={TestId.editDoctorButton}
              disabled={!selectedDoctor?.id}
              buttonType="link"
              leftIcon="edit"
              onClick={handleEditDoctor}
            >
              {t("general.buttons.edit")}
            </Button>
            <Button
              data-testid={TestId.deleteDoctorButton}
              disabled={!selectedDoctor?.id}
              buttonType="link"
              leftIcon="delete"
              onClick={handleDeleteDoctor}
            >
              {t("general.buttons.delete")}
            </Button>
          </DataTableButtonConatiner>
        </DataTableHeaderWrapper>
        <DataTable
          clickable
          columns={columns}
          data={(data ?? []) as unknown as Record<string, unknown>[]}
          onRowsSelected={(indices) => setSelectedDoctor(data?.[indices[0]])}
        />
      </DataTableSection>
    </Root>
  );
}
