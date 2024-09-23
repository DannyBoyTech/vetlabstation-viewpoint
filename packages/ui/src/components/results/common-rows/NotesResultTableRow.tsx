import ReactMarkdown from "react-markdown";
import { type HashedNoteDto } from "@viewpoint/api";
import styled from "styled-components";
import { Cell } from "../common-components/result-table-components";
import { RunTableRow } from "../common-components/RunTableRow";
import { SpotText } from "@viewpoint/spot-react/src";

const NotesSection = styled(Cell)`
  grid-column: 2 / 5;
  display: flex;
  flex-direction: column;
  align-items: start;
`;

const NotesSpotText = styled(SpotText)`
  br {
    // make br to have a margin
    display: block;
    content: "";
    margin-top: 0.5em;
  }
`;

const NotesReactMarkdown = styled(ReactMarkdown)`
  p {
    margin-block-start: 0.7em;
    margin-block-end: 0.7em;
  }
`;

export interface NotesTableSectionProps {
  notes?: HashedNoteDto[];
  additionalColumnCount: number;
  omitBorder?: boolean;
}

export function NotesResultTableRow({
  notes,
  additionalColumnCount,
  omitBorder,
}: NotesTableSectionProps) {
  return (
    <RunTableRow
      includePlaceholders
      additionalColumnCount={additionalColumnCount}
      omitBorder={omitBorder}
    >
      <NotesSection>
        {notes?.map((note) => (
          <NotesSpotText key={note.hashId} level="secondary">
            <NotesReactMarkdown>{note.note}</NotesReactMarkdown>
          </NotesSpotText>
        ))}
      </NotesSection>
    </RunTableRow>
  );
}
