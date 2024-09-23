import ConnectedIcon from "../../assets/smartservice/smartservice-connected.png";
import ConnectingIcon from "../../assets/smartservice/smartservice-connecting.png";
import OfflineIcon from "../../assets/smartservice/smartservice-offline.png";
import DisabledIcon from "../../assets/smartservice/smartservice-disabled.png";
import { useGetSmartServiceStatusQuery } from "../../api/SmartServiceApi";
import { SmartServiceStatus } from "@viewpoint/api";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { NavItem } from "@viewpoint/spot-react/src";

export const TestId = {
  Icon: "smart-service-indicator-icon",
};

const IconImage = styled.img.attrs({ "data-testid": TestId.Icon })`
  height: 25px;
  width: auto;
`;

export function SmartServiceIndicator() {
  const { data: status } = useGetSmartServiceStatusQuery();

  const nav = useNavigate();

  const handleOnClick = () => nav("/settings/smart_service");

  switch (status) {
    case SmartServiceStatus.CONNECTED:
      return (
        <NavItem>
          <IconImage src={ConnectedIcon} onClick={handleOnClick} />
        </NavItem>
      );
    case SmartServiceStatus.CONNECTING:
      return (
        <NavItem>
          <IconImage src={ConnectingIcon} onClick={handleOnClick} />
        </NavItem>
      );
    case SmartServiceStatus.OFFLINE:
      return (
        <NavItem>
          <IconImage src={OfflineIcon} onClick={handleOnClick} />
        </NavItem>
      );
    case SmartServiceStatus.DISABLED:
      return (
        <NavItem>
          <IconImage src={DisabledIcon} onClick={handleOnClick} />
        </NavItem>
      );
    default:
      return <></>;
  }
}
