import { Button, Modal } from "@viewpoint/spot-react";
import {
  CellsDto,
  CytologyImageObjectDto,
  PimsConnectionType,
  PimsTransmissionType,
  SettingTypeEnum,
} from "@viewpoint/api";
import { useCallback, useContext, useState } from "react";
import styled from "styled-components";
import { ViewpointResultsPageContext } from "../../context/ResultsPageContext";
import { LocalizedPatientSignalment } from "../localized-signalment/LocalizedPatientSignalment";
import { ImageSummaryView } from "./ImageSummaryView";
import { Paginator } from "./Paginator";
import { useShareReportWithImageMutation } from "../../api/ReportApi";
import { ImageModalWrapper } from "../image-modal/ImageModalWrapper";
import axios from "axios";
import { ResendModal } from "./ResendModal";
import { PrintModal } from "./PrintModal";
import { useGetSettingsQuery } from "../../api/SettingsApi";
import { useGetSentToPimsQuery } from "../../api/LabRequestsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";
import { pdfViewerOpts, Views } from "../../utils/url-utils";
import { DarkTheme } from "../../utils/StyleConstants";
import {
  ImageViewerConfiguration,
  WrappedImageData,
} from "./common-components";
import { DetailedImageView } from "./DetailedImageView";
import { SpotText } from "@viewpoint/spot-react/src";

const FixedSizeModalWrapper = styled(ImageModalWrapper)`
  /** Fixed size modal for image viewing **/

  .spot-modal {
    max-width: 920px;
    width: 920px;
    height: 690px;
  }

  /** Reduce bottom padding on the header to increase amount of real estate for the image **/

  .spot-modal__header {
    padding-bottom: 5px;
  }

  .spot-modal__titles {
    width: 100%;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ImageTitleHeaderContent = styled.div`
  display: flex;
  justify-content: center;
`;

const DetailedImageViewContainer = styled.div`
  display: flex;
  flex: 1;
  gap: 5px;
  justify-content: center;
  align-items: center;

  &&& > button {
    flex: none;
    padding-left: 0;
    padding-right: 0;
  }
`;

export const TestId = {
  Modal: "image-viewer-modal",
  DetailedImageView: "detailed-image-viewer",
};

const IMAGES_PER_PAGE = 6;
const MAX_USER_SELECTED_IMAGES = 6;

const fetchLabReportWithImageData = async (
  labRequestId: number,
  runId: number,
  imageBytes: ArrayBuffer
) => {
  const response = await axios.post(
    `/labstation-webapp/api/report/labReportWithImageData?labRequestId=${labRequestId}`,
    {
      [runId]: Array.from(new Uint8Array(imageBytes)),
    },
    {
      responseType: "arraybuffer",
    }
  );
  return pdfDataUrl(response.data);
};

function pdfDataUrl(bytes: ArrayBuffer) {
  const pdfBlob = new Blob([bytes], {
    type: "application/pdf",
  });

  return URL.createObjectURL(pdfBlob);
}

export interface ImageViewerProps {
  configuration: ImageViewerConfiguration;
  imageData: WrappedImageData[];
  uuidsMarkedForPermanentRecordByInstrument?: Set<string>;
  uuidsMarkedForPermanentRecordByUser?: Set<string>;
  cells?: Record<string, CellsDto[]>;
  imageObjects?: Record<string, CytologyImageObjectDto[]>;
  totalImagesInRecord: number;
  runId: number;
  visible: boolean;
  onClose: () => void;
  onMarkedForRecordChanged: (uuid: string, marked: boolean) => void;
}

export function ImageViewerModal(props: ImageViewerProps) {
  const { t } = useTranslation();
  const { labRequest } = useContext(ViewpointResultsPageContext);
  const { data: pimsSettings } = useGetSettingsQuery([
    SettingTypeEnum.PIMS_CONNECTION_TYPE,
    SettingTypeEnum.PIMS_TRANSMIT_RESULTS,
  ]) as {
    data?: {
      [SettingTypeEnum.PIMS_CONNECTION_TYPE]: PimsConnectionType;
      [SettingTypeEnum.PIMS_TRANSMIT_RESULTS]: PimsTransmissionType;
    };
  };

  const { data: sentToPims } = useGetSentToPimsQuery(
    labRequest == null ? skipToken : labRequest?.id,
    // No inbound messages from IVLS when a run is sent to PIMS -- just the unsent run count, which is sent on a fixed
    // time interval.
    { pollingInterval: 3000 }
  );

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>();
  const [printOpen, setPrintOpen] = useState<boolean>(false);
  const [printUrl, setPrintUrl] = useState<string | undefined>();
  const [printError, setPrintError] = useState<boolean>(false);
  const [resendOpen, setResendOpen] = useState<boolean>(false);
  const [resendUrl, setResendUrl] = useState<string | undefined>();
  const [resendError, setResendError] = useState<boolean>(false);
  const [imageBytes, setImageBytes] = useState<ArrayBuffer | undefined>(
    undefined
  );

  const validAssays = labRequest?.instrumentRunDtos
    ?.find((ir) => ir.id === props.runId)
    ?.instrumentResultDtos?.map((ir) => ir.assayIdentityName);

  const totalPages = Math.ceil(props.imageData.length / IMAGES_PER_PAGE);
  const slice = props.imageData.slice(
    currentPage * IMAGES_PER_PAGE,
    currentPage * IMAGES_PER_PAGE + IMAGES_PER_PAGE
  );

  const { totalImagesInRecord, onMarkedForRecordChanged } = props;
  const handleToggleMarkedForRecord = useCallback(
    (uuid: string, marked: boolean) => {
      if (!marked || totalImagesInRecord < MAX_USER_SELECTED_IMAGES) {
        onMarkedForRecordChanged(uuid, marked);
      }
    },
    [onMarkedForRecordChanged, totalImagesInRecord]
  );

  const [shareReport, shareReportStatus] = useShareReportWithImageMutation();

  const connectionType = pimsSettings?.[SettingTypeEnum.PIMS_CONNECTION_TYPE];
  const transmissionType =
    pimsSettings?.[SettingTypeEnum.PIMS_TRANSMIT_RESULTS];

  const shareButtonHidden =
    connectionType == null ||
    [
      PimsConnectionType.CORNERSTONE_SERIAL,
      PimsConnectionType.SERIAL,
      PimsConnectionType.NONE,
    ].includes(connectionType) ||
    transmissionType !== PimsTransmissionType.TRANSMIT_RESULTS_AND_REPORT;

  const shareButtonDisabled = !sentToPims;

  return (
    <FixedSizeModalWrapper
      visible={props.visible}
      className={DarkTheme.primaryContainerClass}
    >
      <Modal
        visible={props.visible}
        onClose={props.onClose}
        data-testid={TestId.Modal}
      >
        <Modal.Header onClose={props.onClose}>
          <>
            <HeaderContent>
              <LocalizedPatientSignalment
                size="small"
                patient={labRequest?.patientDto}
              />
              {selectedImageIndex != null && (
                <Paginator
                  currentPage={selectedImageIndex}
                  totalPages={props.imageData.length}
                  onPageBack={() =>
                    setSelectedImageIndex(
                      currentPage * IMAGES_PER_PAGE + selectedImageIndex - 1
                    )
                  }
                  onPageForward={() =>
                    setSelectedImageIndex(
                      currentPage * IMAGES_PER_PAGE + selectedImageIndex + 1
                    )
                  }
                />
              )}
            </HeaderContent>
            {selectedImageIndex != null && (
              <ImageTitleHeaderContent>
                <SpotText level="h5">
                  {props.imageData[selectedImageIndex].imageTitle}
                </SpotText>
              </ImageTitleHeaderContent>
            )}
          </>
        </Modal.Header>
        <Modal.Body>
          {selectedImageIndex != null && labRequest ? (
            <DetailedImageViewContainer data-testid={TestId.DetailedImageView}>
              <Button
                buttonType="link"
                buttonSize="large"
                iconOnly
                leftIcon="previous"
                disabled={selectedImageIndex === 0}
                onClick={() =>
                  setSelectedImageIndex(
                    currentPage * IMAGES_PER_PAGE + selectedImageIndex - 1
                  )
                }
              />
              <DetailedImageView
                configuration={props.configuration}
                shareButtonDisabled={shareButtonDisabled}
                shareButtonHidden={shareButtonHidden}
                availableAssayIdentities={validAssays ?? []}
                shareImageStatus={shareReportStatus}
                onShareImage={async (bytes) => {
                  try {
                    setResendError(false);
                    setResendOpen(true);
                    setImageBytes(bytes);
                    setResendUrl(
                      (await fetchLabReportWithImageData(
                        labRequest.id,
                        props.runId,
                        bytes
                      )) +
                        `#${pdfViewerOpts({
                          toolbar: false,
                          view: Views.FIT_HORIZONTAL,
                        })}`
                    );
                  } catch (e) {
                    setResendError(true);
                  }
                }}
                onPrint={async (bytes) => {
                  try {
                    setPrintError(false);
                    setPrintOpen(true);
                    setPrintUrl(
                      (await fetchLabReportWithImageData(
                        labRequest.id,
                        props.runId,
                        bytes
                      )) +
                        `#${pdfViewerOpts({
                          toolbar: false,
                          view: Views.FIT_HORIZONTAL,
                        })}`
                    );
                  } catch (e) {
                    setPrintError(true);
                  }
                }}
                imageData={props.imageData[selectedImageIndex]}
                markedForPermanentRecordByInstrument={
                  props.uuidsMarkedForPermanentRecordByInstrument?.has(
                    props.imageData[selectedImageIndex].image.imageUuid
                  ) ?? false
                }
                markedForPermanentRecordByUser={
                  props.uuidsMarkedForPermanentRecordByUser?.has(
                    props.imageData[selectedImageIndex].image.imageUuid
                  ) ?? false
                }
                cells={
                  props.cells !== undefined
                    ? props.cells[
                        props.imageData[selectedImageIndex].image.imageUuid
                      ]
                    : []
                }
                imageObjects={
                  props.imageObjects !== undefined
                    ? props.imageObjects[
                        props.imageData[selectedImageIndex].image.imageUuid
                      ]
                    : []
                }
                onGridView={() => setSelectedImageIndex(undefined)}
                onToggleMarkForRecord={(marked) =>
                  handleToggleMarkedForRecord(
                    props.imageData[selectedImageIndex].image.imageUuid,
                    marked
                  )
                }
              />
              <Button
                buttonType="link"
                buttonSize="large"
                iconOnly
                leftIcon="next"
                disabled={selectedImageIndex === props.imageData.length - 1}
                onClick={() =>
                  setSelectedImageIndex(
                    currentPage * IMAGES_PER_PAGE + selectedImageIndex + 1
                  )
                }
              />
            </DetailedImageViewContainer>
          ) : (
            <ImageSummaryView
              configuration={props.configuration}
              displayedImages={slice}
              uuidsMarkedForPermanentRecordByInstrument={
                props.uuidsMarkedForPermanentRecordByInstrument
              }
              uuidsMarkedForPermanentRecordByUser={
                props.uuidsMarkedForPermanentRecordByUser
              }
              onClickImage={(selectedImageIndex) =>
                setSelectedImageIndex(
                  currentPage * IMAGES_PER_PAGE + selectedImageIndex
                )
              }
              onToggleMarkForRecord={handleToggleMarkedForRecord}
              onPageBack={() => setCurrentPage(currentPage - 1)}
              onPageForward={() => setCurrentPage(currentPage + 1)}
              currentPage={currentPage}
              totalPages={totalPages}
              imagesInRecord={props.totalImagesInRecord}
            />
          )}
          {printOpen ? (
            <PrintModal
              data-testid="print-modal"
              open={true}
              url={printUrl}
              error={printError}
              onClose={() => setPrintOpen(false)}
              onConfirm={() => setPrintOpen(false)}
              printJobName={t("general.printJobs.resultsReport")}
            />
          ) : null}
          {resendOpen ? (
            <ResendModal
              data-testid="resend-modal"
              open={true}
              url={resendUrl}
              error={resendError}
              onClose={() => setResendOpen(false)}
              onConfirm={() => {
                if (labRequest && imageBytes) {
                  shareReport({
                    labRequestId: labRequest.id,
                    runId: props.runId,
                    imageData: imageBytes,
                  });
                  setImageBytes(undefined);
                }
                setResendOpen(false);
              }}
            />
          ) : null}
        </Modal.Body>
      </Modal>
    </FixedSizeModalWrapper>
  );
}
