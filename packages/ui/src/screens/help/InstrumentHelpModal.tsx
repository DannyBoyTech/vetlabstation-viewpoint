import { InstrumentType } from "@viewpoint/api";
import { List, Modal, SpotText } from "@viewpoint/spot-react";
import {
  SideBarModalRoot,
  SideBarModalSideBarRoot,
} from "../../components/modal/ModalWithSideBar";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import QRCode from "qrcode";
import { getInstrumentDisplayImage } from "../../utils/instrument-utils";
import { ResponsiveModalWrapper } from "../../components/modal/ResponsiveModalWrapper";

const StyledModalRoot = styled(SideBarModalRoot)`
  height: 500px;
  width: 650px;
`;

const SideBarRoot = styled(SideBarModalSideBarRoot)`
  img {
    object-fit: contain;
    height: 100%;
    width: 100%;
  }
`;

const Content = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const QRImageContainer = styled.div`
  flex: 1;
  align-items: center;
  justify-content: center;
  display: flex;

  > img {
    height: 250px;
  }
`;

export interface InstrumentHelpModalProps {
  open: boolean;
  availableInstruments: InstrumentType[];
  onInstrumentSelected: (instrument: InstrumentType) => void;
  onClose: () => void;
  selectedInstrument: InstrumentType;
}

export function InstrumentHelpModal(props: InstrumentHelpModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const imgRefs = useRef<{ [key in InstrumentType]?: HTMLImageElement | null }>(
    {}
  );

  useEffect(() => {
    imgRefs.current?.[props.selectedInstrument]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [props.selectedInstrument]);

  useEffect(() => {
    QRCode.toDataURL(
      t(`links:help.instruments.${props.selectedInstrument}` as any)
    ).then((url) => setQrCodeUrl(url));
  }, [t, props.selectedInstrument]);

  return (
    <ResponsiveModalWrapper>
      <Modal.Overlay
        visible={props.open}
        onClose={props.onClose}
        modalRef={modalRef}
        dismissable
      >
        <StyledModalRoot ref={modalRef}>
          <SideBarRoot>
            {props.availableInstruments.map((instrument) => (
              <List.Item
                key={instrument}
                active={props.selectedInstrument === instrument}
                onClick={() => props.onInstrumentSelected(instrument)}
              >
                <img
                  src={getInstrumentDisplayImage(instrument)}
                  alt={instrument}
                  ref={(ref) => {
                    imgRefs.current[instrument] = ref;
                  }}
                />
              </List.Item>
            ))}
          </SideBarRoot>
          <Modal.Popup>
            <Modal.Header onClose={props.onClose} dismissable>
              <SpotText level="h4" bold className="spot-modal__secondary-title">
                {t("helpScreen.instrumentModal.title")}
              </SpotText>
              <SpotText level="h2" className="spot-modal__title">
                {t(`instruments.names.${props.selectedInstrument}`)}
              </SpotText>
            </Modal.Header>

            <Modal.Body>
              <Content>
                <SpotText level="paragraph">
                  {t("helpScreen.instrumentModal.instructions", {
                    instrumentName: t(
                      `instruments.names.${props.selectedInstrument}`,
                      { context: "extended" }
                    ),
                  })}
                </SpotText>
                <QRImageContainer>
                  <img src={qrCodeUrl} alt={props.selectedInstrument} />
                </QRImageContainer>
              </Content>
            </Modal.Body>
          </Modal.Popup>
        </StyledModalRoot>
      </Modal.Overlay>
    </ResponsiveModalWrapper>
  );
}
