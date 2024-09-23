import styled from "styled-components";
import {
  Divider,
  Header,
  HeaderButton,
  PageContainer,
  Root,
} from "../common-slideout-components";
import {
  RunEditHistoryDto,
  SnapDeviceAltDto,
  SnapDeviceDto,
  SnapResultTypeEnum,
  UserEnteredSnapResultDto,
} from "@viewpoint/api";
import { Trans, useTranslation } from "react-i18next";
import { Input, Label, SpotText, Tabs, TextArea } from "@viewpoint/spot-react";
import {
  ChangeEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CommonTransComponents } from "../../../utils/i18n-utils";
import { SNAPSpotPicker } from "../../snap/SNAPSpotPicker";
import {
  convertDotsToResultEnum,
  getDefaultResultType,
  getDefinition,
  getResultsEntryType,
  getSelectedSnapDots,
  selectDotsForResultEnum,
} from "./SNAPDefinitions";
import { StickyHeaderDataTable } from "../../table/StickyHeaderTable";
import { InputAware } from "../../InputAware";
import {
  SNAPResultEntryType,
  SNAPRowSelectionDeviceDefinition,
} from "./definitions/definition-constants";
import { SNAPRowSelection } from "../../snap/SNAPRowSelection";
import { SegmentedDateTimeCell } from "../../table/SegmentedDateTimeCell";
import { AngioDetectPicker } from "../../snap/angio-detect/AngioDetectPicker";
import { SNAPColumnSelection } from "../../snap/SNAPColumnSelection";

export const TestId = {
  TestName: "snap-results-entry-test-name",
  SaveButton: "snap-results-entry-save-button",
};

const TestName = styled(SpotText)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledTabBar = styled(Tabs.TabBar)`
  & > .spot-tabs__list {
    justify-content: center;
  }
`;

const EntryContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;

  .spot-tabs.spot-tabs--responsive {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .spot-tabs__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
`;

export const SNAPResultsTab = {
  Results: "Results",
  Comments: "Comments",
} as const;

export type SNAPResultsTab =
  (typeof SNAPResultsTab)[keyof typeof SNAPResultsTab];

export type SnapResultUpdate = Pick<
  UserEnteredSnapResultDto,
  "snapResultType" | "userComment" | "userId"
>;

export interface SNAPResultsEntryProps {
  editHistory?: RunEditHistoryDto[];
  snapDevice: SnapDeviceDto | SnapDeviceAltDto;
  onClose: () => void;
  onDone: (update: SnapResultUpdate) => void;

  footerContent?: ReactNode;
  initialResult?: UserEnteredSnapResultDto;
}

function getDefaultSnapResultTypeSafely(snapDeviceId: number) {
  try {
    return getDefaultResultType(snapDeviceId);
  } catch (err) {
    console.error(err);
  }
}

function getResultEntryTypeSafely(snapDeviceId: number) {
  try {
    return getResultsEntryType(snapDeviceId);
  } catch (err) {
    console.error(err);
  }
}

export function SNAPResultsEntry(props: SNAPResultsEntryProps) {
  const [selectedTab, setSelectedTab] = useState<SNAPResultsTab>(
    SNAPResultsTab.Results
  );

  const [selectedResult, setSelectedResult] = useState<
    SnapResultTypeEnum | undefined
  >(
    props.initialResult?.snapResultType ??
      getDefaultSnapResultTypeSafely(props.snapDevice.snapDeviceId)
  );

  const [comment, setComment] = useState<string>();
  const [userId, setUserId] = useState<string>();

  const resultsEntryType = getResultEntryTypeSafely(
    props.snapDevice.snapDeviceId
  );

  const { t } = useTranslation();

  const handleDone = () => {
    if (selectedResult != null) {
      props.onDone({
        snapResultType: selectedResult,
        userComment: comment,
        userId,
      });
    }
  };

  return (
    <Root>
      <Header>
        <HeaderButton buttonType="secondary" onClick={props.onClose}>
          {t("general.buttons.close")}
        </HeaderButton>
        <TestName level="paragraph" bold data-testid={TestId.TestName}>
          {t(props.snapDevice.displayNamePropertyKey as any)}
        </TestName>

        <HeaderButton
          buttonType="primary"
          onClick={handleDone}
          disabled={selectedResult == null}
          data-testid={TestId.SaveButton}
        >
          {t("general.buttons.save")}
        </HeaderButton>
      </Header>

      <Divider />

      <PageContainer>
        <EntryContent>
          <Tabs>
            <StyledTabBar>
              <Tabs.Tab
                active={selectedTab === SNAPResultsTab.Results}
                onClick={() => setSelectedTab(SNAPResultsTab.Results)}
              >
                {t("resultsEntry.snap.tabs.results")}
              </Tabs.Tab>
              <Tabs.Tab
                active={selectedTab === SNAPResultsTab.Comments}
                onClick={() => setSelectedTab(SNAPResultsTab.Comments)}
              >
                {t("resultsEntry.snap.tabs.comment")}
              </Tabs.Tab>
            </StyledTabBar>

            <Tabs.Content>
              {selectedTab === SNAPResultsTab.Results && (
                <>
                  {resultsEntryType === SNAPResultEntryType.AngioDetect && (
                    <AngioDetectResultsEntry
                      selectedResult={selectedResult}
                      onResultChanged={setSelectedResult}
                    />
                  )}
                  {resultsEntryType === SNAPResultEntryType.SpotPicker && (
                    <SpotPickerResultsEntry
                      snapDeviceId={props.snapDevice.snapDeviceId}
                      selectedResult={selectedResult}
                      onResultChanged={setSelectedResult}
                    />
                  )}
                  {resultsEntryType === SNAPResultEntryType.RowSelection && (
                    <RowSelectionResultEntry
                      snapDeviceId={props.snapDevice.snapDeviceId}
                      selectedResult={selectedResult}
                      onResultChanged={setSelectedResult}
                    />
                  )}
                  {resultsEntryType === SNAPResultEntryType.ColumnSelection && (
                    <SNAPColumnSelection
                      snapDeviceId={props.snapDevice.snapDeviceId}
                      selectedResult={selectedResult}
                      onResultChanged={setSelectedResult}
                    />
                  )}
                </>
              )}
              {selectedTab === SNAPResultsTab.Comments && (
                <CommentTab
                  comment={comment}
                  editHistory={props.editHistory}
                  onCommentChange={setComment}
                  onUserIdChange={setUserId}
                  userId={userId}
                />
              )}
            </Tabs.Content>
          </Tabs>
        </EntryContent>

        {props.footerContent}
      </PageContainer>
    </Root>
  );
}

const ResultsEntryContentRoot = styled.div`
  margin: 24px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 24px;
`;

interface AngioDetectResultsEntryProps {
  selectedResult?: SnapResultTypeEnum;
  onResultChanged: (result?: SnapResultTypeEnum) => void;
}

function AngioDetectResultsEntry({
  selectedResult,
  onResultChanged,
}: AngioDetectResultsEntryProps) {
  const positive =
    selectedResult === SnapResultTypeEnum.CANINE_ANGIO_DETECT_POSITIVE;

  const handleIndicatorClick = () => {
    const result = positive
      ? SnapResultTypeEnum.CANINE_ANGIO_DETECT_NEGATIVE
      : SnapResultTypeEnum.CANINE_ANGIO_DETECT_POSITIVE;
    onResultChanged(result);
  };

  return (
    <ResultsEntryContentRoot>
      <SpotText level="secondary">
        <Trans
          i18nKey="resultsEntry.snap.resultsPage.instructions"
          count={1}
          components={CommonTransComponents}
        />
      </SpotText>

      <AngioDetectPicker
        positive={positive}
        onIndicatorClick={handleIndicatorClick}
      />
    </ResultsEntryContentRoot>
  );
}

export interface ResultsEntryContentProps {
  snapDeviceId: number;
  selectedResult?: SnapResultTypeEnum;
  onResultChanged: (result?: SnapResultTypeEnum) => void;
}

function SpotPickerResultsEntry(props: ResultsEntryContentProps) {
  // Current selected dot state based on the selected SNAP result enum
  const dots = useMemo(
    () =>
      props.selectedResult == null
        ? []
        : selectDotsForResultEnum(
            getSelectedSnapDots(props.snapDeviceId),
            props.selectedResult,
            props.snapDeviceId
          ),
    [props.selectedResult, props.snapDeviceId]
  );

  function handleDotClicked(dotId: string) {
    const resultEnum = convertDotsToResultEnum(
      dots.map((dot) => ({
        ...dot,
        selected: dot.dotId === dotId ? !dot.selected : dot.selected,
      })),
      props.snapDeviceId
    );
    if (resultEnum != null) {
      props.onResultChanged(resultEnum);
    }
  }

  return (
    <ResultsEntryContentRoot>
      <SpotText level="secondary">
        <Trans
          i18nKey="resultsEntry.snap.resultsPage.instructions"
          count={dots.length}
          components={CommonTransComponents}
        />
      </SpotText>

      <SNAPSpotPicker onDotClicked={handleDotClicked} dots={dots} />
    </ResultsEntryContentRoot>
  );
}

const CommentEntryRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
`;

const CommentTextArea = styled(TextArea)`
  resize: none;
  height: 122px;
`;

const CommentSection = styled.div`
  padding: 3px;
`;

const UserIdSection = styled.div`
  padding: 3px;
`;

const HistorySection = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;

  overflow: hidden;
  padding: 3px;
`;

const HistoryTable = styled(StickyHeaderDataTable)`
  > table {
    table-layout: fixed;
    width: 100%;
  }

  th,
  td {
    overflow-wrap: break-word;
    overflow: hidden;
    padding: 2px 5px;
  }

  th:nth-of-type(1),
  td:nth-of-type(1) {
    width: 22%;
  }

  th:nth-of-type(2),
  td:nth-of-type(2) {
    width: 54%;
  }

  th:nth-of-type(3),
  td:nth-of-type(3) {
    width: 24%;
  }
`;

// this is a type alias rather than interface to get around
// https://github.com/microsoft/TypeScript/issues/15300
// when passing an object as a Record<string, unknown> for data table
type EditRecord = {
  comment?: string;
  editDate?: number;
  userId?: string;
};

interface CommentHistoryProps {
  editHistory: EditRecord[];
}

function CommentHistory(props: CommentHistoryProps) {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        Header: t("resultsEntry.snap.commentTab.editDate"),
        accessor: "editDate",
        Cell: SegmentedDateTimeCell,
      },
      {
        Header: t("resultsEntry.snap.commentTab.comment"),
        accessor: "comment",
      },
      {
        Header: t("resultsEntry.snap.commentTab.userId"),
        accessor: "userId",
      },
    ],
    [t]
  );

  return <HistoryTable columns={columns} data={props.editHistory} />;
}

interface CommentTabProps {
  comment?: string;
  editHistory?: RunEditHistoryDto[];
  onCommentChange?: (comment?: string) => void;
  onUserIdChange?: (userId?: string) => void;
  userId?: string;
}

function CommentTab(props: CommentTabProps) {
  const { t } = useTranslation();
  const handleCommentChange = (ev: ChangeEvent<HTMLTextAreaElement>) => {
    props.onCommentChange?.(ev.target.value);
  };

  const handleUserIdChange = (ev: ChangeEvent<HTMLInputElement>) => {
    props.onUserIdChange?.(ev.target.value);
  };

  const commentRef = useRef<HTMLTextAreaElement>(null);
  const { editHistory } = props;
  useEffect(() => {
    if (editHistory == null || editHistory.length === 0) {
      commentRef.current?.focus();
    }
  }, [editHistory]);

  return (
    <CommentEntryRoot>
      <CommentSection>
        <Label htmlFor="comment_comment">
          {t("resultsEntry.snap.commentTab.comment")}
        </Label>
        <InputAware>
          <CommentTextArea
            innerRef={commentRef}
            id="comment_comment"
            value={props.comment}
            onChange={handleCommentChange}
          />
        </InputAware>
      </CommentSection>

      <UserIdSection>
        <Label htmlFor="comment_userId">
          {t("resultsEntry.snap.commentTab.userId")}
        </Label>
        <InputAware>
          <Input
            id="comment_userId"
            value={props.userId}
            onChange={handleUserIdChange}
            autoComplete="off"
          />
        </InputAware>
      </UserIdSection>

      {props.editHistory && props.editHistory.length > 0 && (
        <HistorySection>
          <Label>{t("resultsEntry.snap.commentTab.editHistory")}</Label>
          <CommentHistory editHistory={props.editHistory} />
        </HistorySection>
      )}
    </CommentEntryRoot>
  );
}

function RowSelectionResultEntry(props: ResultsEntryContentProps) {
  const definition = useMemo(
    () => getDefinition(props.snapDeviceId) as SNAPRowSelectionDeviceDefinition,
    [props.snapDeviceId]
  );

  const selectedRow = useMemo(
    () => definition.rows.find((row) => row.result === props.selectedResult),
    [definition.rows, props.selectedResult]
  );

  return (
    <SNAPRowSelection
      rows={definition.rows}
      exampleImage={definition.example.dots}
      exampleInstructions={definition.example.instructions}
      selectedRowId={selectedRow?.rowId}
      onRowSelected={(rowId) =>
        props.onResultChanged(
          rowId == null
            ? undefined
            : definition.rows.find((row) => row.rowId === rowId)?.result
        )
      }
    />
  );
}
