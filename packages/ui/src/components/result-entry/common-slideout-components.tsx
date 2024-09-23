import { Button } from "@viewpoint/spot-react";
import styled from "styled-components";
import { Theme } from "../../utils/StyleConstants";
import {
  useGetDetailedLabRequestQuery,
  useGetRunningLabRequestsQuery,
} from "../../api/LabRequestsApi";
import { PropsWithChildren } from "react";

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${(p: { theme: Theme }) =>
    p.theme.colors?.background?.primary};
`;
export const Divider = styled.div`
  border: ${(p: { theme: Theme }) => p.theme.borders?.lightPrimary};
`;
export const PageContainer = styled.div`
  padding: 15px;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 15px;
`;
export const CancelRunContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
  gap: 16px;
  button {
    padding-left: 0;
  }
`;
export const Header = styled.div`
  display: flex;
  margin: 8px 14px;
`;
export const HeaderButton = styled(Button)`
  font-weight: bold;
`;

export interface ManualEntrySlideOutProps extends PropsWithChildren {
  open: boolean;
  closing: boolean;
  onClose: () => void;
}

interface UseInstrumentRunDataForManualEntryProps {
  runId: number;
  labRequestId: number;
}

/**
 * IVLS doesn't expose an endpoint for getting instrument run by ID. This hook
 * will take the lab request and run ID for a given run, and return both the
 * in process and detailed version of the run (if available).
 *
 * @param runId
 * @param labRequestId
 */
export function useInstrumentRunDataForManualEntry({
  runId,
  labRequestId,
}: UseInstrumentRunDataForManualEntryProps) {
  const {
    data: { inProcessRun, labRequest: inProcessLabRequest },
    isLoading: inProcessResultsLoading,
  } = useGetRunningLabRequestsQuery(undefined, {
    selectFromResult: ({ data: labRequests, ...rest }) => {
      const labRequest = labRequests?.find((lr) => lr.id === labRequestId);
      return {
        ...rest,
        data: {
          inProcessRun: labRequest?.instrumentRunDtos?.find(
            (ir) => ir.id === runId
          ),
          labRequest,
        },
      };
    },
  });
  const {
    data: { detailedRun, labRequest: detailedLabRequest },
    isLoading: detailedResultsLoading,
  } = useGetDetailedLabRequestQuery(
    { labRequestId },
    {
      selectFromResult: ({ data: labRequest, ...rest }) => ({
        ...rest,
        data: {
          detailedRun: labRequest?.instrumentRunDtos?.find(
            (ir) => ir.id === runId
          ),
          labRequest,
        },
      }),
    }
  );

  return {
    inProcessRun,
    inProcessLabRequest,
    detailedRun,
    detailedLabRequest,
    isLoading: inProcessResultsLoading || detailedResultsLoading,
  };
}
