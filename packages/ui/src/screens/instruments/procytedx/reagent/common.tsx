import styled from "styled-components";

export const ContentRoot = styled.div`
  display: flex;
  flex: 1;
  gap: 10px;
  padding: 0 75px 0 25px;

  ol {
    margin: unset;
  }

  li {
    margin-bottom: 20px;
  }
`;
export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 3;
`;
export const RightColumn = styled.div`
  flex: 4;
`;
export const CommonImg = styled.img`
  align-self: flex-start;
  max-width: 100%;
`;
