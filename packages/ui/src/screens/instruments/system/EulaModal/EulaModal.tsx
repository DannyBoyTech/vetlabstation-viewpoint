import { useTranslation } from "react-i18next";
import { useGetEulaQuery } from "../../../../api/ServerResourceApi";
import styled from "styled-components";
import { Theme } from "../../../../utils/StyleConstants";
import { ConfirmModal } from "../../../../components/confirm-modal/ConfirmModal";
import { FullSizeSpinner } from "../../../../components/spinner/FullSizeSpinner";
import { WindowsEulaTypeEnum } from "@viewpoint/api";
import { ResponsiveModalWrapper } from "../../../../components/modal/ResponsiveModalWrapper";

const ModalWrapper = styled(ResponsiveModalWrapper)`
  .spot-modal {
    max-width: 95vw;
    width: auto;
  }

  .spot-modal__content {
    overflow-y: scroll;
  }
`;

const Content = styled.p`
  background-color: ${(t: { theme: Theme }) =>
    t.theme.colors?.background?.secondary};
  padding: 20px;
  white-space: pre-line;
`;

export enum LicenseItem {
  JETTY = "JETTY",
  FELIX = "FELIX",
  SLING = "SLING",
  COMMONS_LOGGING = "COMMONS_LOGGING",
  COMMONS_CODEC = "COMMONS_CODEC",
  COMMONS_LANG = "COMMONS_LANG",
  IMGSCALR = "IMGSCALR",
  JCONNECT = "JCONNECT",
  COMFYJ = "COMFYJ",
  JNIWRAP = "JNIWRAP",
  WINPACK = "WINPACK",
  PDFBOX = "PDFBOX",
  MIG_LAYOUT = "MIG_LAYOUT",
  NETTY = "NETTY",
  LIQUIBASE = "LIQUIBASE",
  SMAKEYAML = "SMAKEYAML",
  NETGEAR_R7000 = "NETGEAR_R7000",
  RABBIT_MQ_SERVER = "RABBIT_MQ_SERVER",
  ERLANG_R16B03 = "ERLANG_R16B03",
  ERLANG_OTP192 = "ERLANG_OTP192",
  JSERIALCOMM = "JSERIALCOMM",
  SLF4J = "SLF4J",
  SPRING = "SPRING",
  AOP_ALLIANCE = "AOP_ALLIANCE",
  JACKSON = "JACKSON",
  SQL_SERVER_2008 = "SQL_SERVER_2008",
  SQL_SERVER_2016 = "SQL_SERVER_2016",
  COMMONS_IO = "COMMONS_IO",
  LOGBACK = "LOGBACK",
  AMQP = "AMQP",
  RABBIT_MQ = "RABBIT_MQ",
  ASPECTJ = "ASPECTJ",
  HIBERNATE = "HIBERNATE",
  JSOUP = "JSOUP",
  JAVA = "JAVA",
  XSTREAM = "XSTREAM",
  XPP3 = "XPP3",
  ANTLR = "ANTLR",
  STRING_TEMPLATE = "STRING_TEMPLATE",
  BOUNCY_CASTLE_MAIL = "BOUNCY_CASTLE_MAIL",
  BOUNCY_CASTLE_PROV = "BOUNCY_CASTLE_PROV",
  BOUNCY_CASTLE_TSP = "BOUNCY_CASTLE_TSP",
  ITEXT = "ITEXT",
  BEAN_UTILS = "BEAN_UTILS",
  COMMONS_COLLECTIONS = "COMMONS_COLLECTIONS",
  COMMONS_DBCP = "COMMONS_DBCP",
  COMMONS_DIGESTER = "COMMONS_DIGESTER",
  COMMONS_NET = "COMMONS_NET",
  COMMONS_POOL = "COMMONS_POOL",
  DOM4J = "DOM4J",
  JDT_CORE = "JDT_CORE",
  JFREE = "JFREE",
  GERONIMO = "GERONIMO",
  JASPER = "JASPER",
  POI = "POI",
  TOMCAT = "TOMCAT",
  XML_BEANS = "XML_BEANS",
  CASTOR = "CASTOR",
  JAVA_ASSIST = "JAVA_ASSIST",
  JBOSS_LOGGING = "JBOSS_LOGGING",
  JBOSS_TRANSACTION = "JBOSS_TRANSACTION",
  APACHE_STAX = "APACHE_STAX",
  JCOMMON = "JCOMMON",
  MEDIA_BURNER = "MEDIA_BURNER",
  OBJENESIS = "OBJENESIS",
  XML_PULL = "XML_PULL",
}

export const LicenseEulaMapping: { [key in LicenseItem]: WindowsEulaTypeEnum } =
  {
    [LicenseItem.JETTY]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.FELIX]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.SLING]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.COMMONS_LOGGING]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.COMMONS_CODEC]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.COMMONS_LANG]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.IMGSCALR]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.JCONNECT]: WindowsEulaTypeEnum.SYBASE,
    [LicenseItem.COMFYJ]: WindowsEulaTypeEnum.TEAMDEV,
    [LicenseItem.JNIWRAP]: WindowsEulaTypeEnum.TEAMDEV,
    [LicenseItem.WINPACK]: WindowsEulaTypeEnum.TEAMDEV,
    [LicenseItem.PDFBOX]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.MIG_LAYOUT]: WindowsEulaTypeEnum.MIGLAYOUT,
    [LicenseItem.NETTY]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.LIQUIBASE]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.SMAKEYAML]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.NETGEAR_R7000]: WindowsEulaTypeEnum.R7000,
    [LicenseItem.RABBIT_MQ_SERVER]: WindowsEulaTypeEnum.RABBITMQ,
    [LicenseItem.ERLANG_R16B03]: WindowsEulaTypeEnum.ERLANG,
    [LicenseItem.ERLANG_OTP192]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.JSERIALCOMM]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.SLF4J]: WindowsEulaTypeEnum.SLF4J,
    [LicenseItem.SPRING]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.AOP_ALLIANCE]: WindowsEulaTypeEnum.AOPALLIANCE,
    [LicenseItem.JACKSON]: WindowsEulaTypeEnum.LGPL,
    [LicenseItem.SQL_SERVER_2008]: WindowsEulaTypeEnum.SQLSERVER2008,
    [LicenseItem.SQL_SERVER_2016]: WindowsEulaTypeEnum.SQLSERVER2016,
    [LicenseItem.COMMONS_IO]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.LOGBACK]: WindowsEulaTypeEnum.ECLIPSE,
    [LicenseItem.AMQP]: WindowsEulaTypeEnum.MOZILLA,
    [LicenseItem.RABBIT_MQ]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.ASPECTJ]: WindowsEulaTypeEnum.ECLIPSE,
    [LicenseItem.HIBERNATE]: WindowsEulaTypeEnum.LGPL,
    [LicenseItem.JSOUP]: WindowsEulaTypeEnum.JSOUP,
    [LicenseItem.JAVA]: WindowsEulaTypeEnum.ORACLEBCL,
    [LicenseItem.XSTREAM]: WindowsEulaTypeEnum.XSTREAM,
    [LicenseItem.XPP3]: WindowsEulaTypeEnum.XPP3,
    [LicenseItem.ANTLR]: WindowsEulaTypeEnum.ANTLR,
    [LicenseItem.STRING_TEMPLATE]: WindowsEulaTypeEnum.SPRINGTEMPLATE,
    [LicenseItem.BOUNCY_CASTLE_MAIL]: WindowsEulaTypeEnum.BOUNCYCASTLE,
    [LicenseItem.BOUNCY_CASTLE_PROV]: WindowsEulaTypeEnum.BOUNCYCASTLE,
    [LicenseItem.BOUNCY_CASTLE_TSP]: WindowsEulaTypeEnum.BOUNCYCASTLE,
    [LicenseItem.ITEXT]: WindowsEulaTypeEnum.MOZILLA,
    [LicenseItem.BEAN_UTILS]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.COMMONS_COLLECTIONS]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.COMMONS_DBCP]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.COMMONS_DIGESTER]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.COMMONS_NET]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.COMMONS_POOL]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.DOM4J]: WindowsEulaTypeEnum.DOM4J,
    [LicenseItem.JDT_CORE]: WindowsEulaTypeEnum.ECLIPSE,
    [LicenseItem.JFREE]: WindowsEulaTypeEnum.LGPL,
    [LicenseItem.GERONIMO]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.JASPER]: WindowsEulaTypeEnum.LGPL,
    [LicenseItem.POI]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.TOMCAT]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.XML_BEANS]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.CASTOR]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.JAVA_ASSIST]: WindowsEulaTypeEnum.LGPL,
    [LicenseItem.JBOSS_LOGGING]: WindowsEulaTypeEnum.LGPL,
    [LicenseItem.JBOSS_TRANSACTION]: WindowsEulaTypeEnum.CDDL,
    [LicenseItem.APACHE_STAX]: WindowsEulaTypeEnum.APACHE,
    [LicenseItem.JCOMMON]: WindowsEulaTypeEnum.LGPL,
    [LicenseItem.MEDIA_BURNER]: WindowsEulaTypeEnum.CPOL,
    [LicenseItem.OBJENESIS]: WindowsEulaTypeEnum.OBJENESIS,
    [LicenseItem.XML_PULL]: WindowsEulaTypeEnum.XMLPULL,
  };

interface EulaDetailModalProps {
  onClose: () => void;
  currentLicense: LicenseItem;
}

export const EulaDetailModal = (props: EulaDetailModalProps) => {
  const { t } = useTranslation();
  const { data: eula, isLoading: isEulaLoading } = useGetEulaQuery(
    LicenseEulaMapping[props.currentLicense]
  );

  return (
    <ModalWrapper>
      <ConfirmModal
        open={true}
        onClose={props.onClose}
        headerContent={t(
          "instrumentScreens.system.systemInformation.softwareLicense"
        )}
        bodyContent={
          isEulaLoading || !eula ? (
            <FullSizeSpinner />
          ) : (
            <Content>{eula}</Content>
          )
        }
        confirmButtonContent={t("general.buttons.back")}
        onConfirm={props.onClose}
      />
    </ModalWrapper>
  );
};
