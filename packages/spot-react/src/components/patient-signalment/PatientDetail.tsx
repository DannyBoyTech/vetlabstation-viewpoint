import React, { ReactNode } from "react";
import styled from "styled-components";

export interface PatientDetail {
  speciesName?: string;
  breed?: string;
  gender?: string;
  age?: string;
}

export interface PatientDetailProps {
  detail?: PatientDetail;
  additionalDetail?: ReactNode;
}

const placeholder = "--";
const separator = "|";

const Wrapper = styled.div`
  display: flex;
  gap: 3px;
`;

const ItemSeparator = () => <span> {separator} </span>;

export const PatientDetail = (props: PatientDetailProps) => {
  return (
    <Wrapper className="spot-patient-display__pet-info">
      <>
        {props.detail?.speciesName ?? placeholder}
        <ItemSeparator />
      </>

      <>
        {props.detail?.breed ?? placeholder}
        <ItemSeparator />
      </>

      <>
        {props.detail?.gender ?? placeholder}
        <ItemSeparator />
      </>

      <>{props.detail?.age ?? placeholder}</>

      {props.additionalDetail && (
        <>
          <ItemSeparator />
          {props.additionalDetail}
        </>
      )}
    </Wrapper>
  );
};
