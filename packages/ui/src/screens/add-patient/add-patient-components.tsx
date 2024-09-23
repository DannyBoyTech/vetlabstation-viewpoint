import styled from "styled-components";

export const TestId = {
  Cancel: "cancel-button",
  Next: "next-button",
  CancelModal: "cancel-changes-modal",
} as const;
export const PatientEntryScreenContainer = styled.div`
  width: 100%;
  height: 100%;
`;
export const InnerContainer = styled.div`
  margin: 30px;
  display: flex;
`;
export const PatientEntryWrapper = styled.div`
  flex: 4;
`;
export const ButtonContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 200px;

  > .spot-button {
    margin-bottom: 1rem;
    justify-content: center;
  }
`;
