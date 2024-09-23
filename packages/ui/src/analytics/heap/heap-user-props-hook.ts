import { useEffect } from "react";
import { useGetSystemInfoQuery } from "../../api/SystemInfoApi";
import { useGetPracticeInfoQuery } from "../../api/PracticeApi";

const HeapUserProperties = {
  SERIAL_NUMBER: "SerialNumber",
  SAP_ID: "SapId",
};

export const useHeapUserProps = () => {
  const { data: systemInfo } = useGetSystemInfoQuery();
  const { data: practiceInfo } = useGetPracticeInfoQuery();

  useEffect(() => {
    if (systemInfo?.serialNumber != null) {
      window.heap?.addUserProperties({
        [HeapUserProperties.SERIAL_NUMBER]: systemInfo?.serialNumber,
      });
    }
  }, [systemInfo?.serialNumber]);

  useEffect(() => {
    if (practiceInfo?.sapId != null) {
      window.heap?.addUserProperties({
        [HeapUserProperties.SAP_ID]: practiceInfo?.sapId,
      });
    }
  }, [practiceInfo?.sapId]);
};
