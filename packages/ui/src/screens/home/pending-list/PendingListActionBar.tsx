import styled from "styled-components";
import { forwardRef, useEffect, useRef, useState } from "react";
import {
  SearchBar,
  SearchBarInput,
  SearchBarInputProps,
} from "@viewpoint/spot-react";
import { SpotIcon } from "@viewpoint/spot-icons";
import { useTranslation } from "react-i18next";
import { InputAware } from "../../../components/InputAware";
import {
  HomeScreenButton,
  HomeScreenButtonContainer,
} from "../HomeScreenComponents";

export const TestId = {
  AnalyzeSampleButton: "analyze-sample-button",
  pendingPimsSearchButton: "pending-pims-search-button",
  pendingPimsSearchInput: "pending-pims-search-input",
};

const ActionContainer = styled.div`
  display: flex;
  opacity: 1;
  flex: 1;

  transition: flex 0.3s 0.1s ease-in-out;

  &.collapsed {
    flex: 0;
  }
`;
const SearchContainer = styled.div`
  margin: 3px;
  flex: 1;
  display: flex;
`;

interface PendingListActionBarProps {
  onSearchInputChanged: (searchString: string) => void;
  onAnalyzeSample: () => void;
}

export function PendingListActionBar(props: PendingListActionBarProps) {
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (searching) {
      inputRef.current?.focus();
    }
  }, [searching]);

  return (
    <HomeScreenButtonContainer>
      {searching ? (
        <SearchContainer className={searching ? "show" : "hidden"}>
          <InputAware>
            <FilterInput
              data-testid={TestId.pendingPimsSearchInput}
              ref={inputRef}
              placeholder={t("home.pendingList.searchPlaceholder")}
              onChange={(ev) => props.onSearchInputChanged(ev.target.value)}
              onCancel={() => {
                props.onSearchInputChanged("");
                setSearching(!searching);
              }}
            />
          </InputAware>
        </SearchContainer>
      ) : (
        <ActionContainer
          data-testid={TestId.pendingPimsSearchButton}
          className={searching ? "hidden" : "show"}
          onClick={() => {
            setSearching(true);
          }}
        >
          <HomeScreenButton iconOnly leftIcon="search" />
        </ActionContainer>
      )}
      <ActionContainer className={searching ? "collapsed" : ""}>
        <HomeScreenButton
          iconOnly
          data-testid={TestId.AnalyzeSampleButton}
          leftIcon="plus"
          onClick={props.onAnalyzeSample}
        />
      </ActionContainer>
    </HomeScreenButtonContainer>
  );
}

const StyledSearchBar = styled(SearchBar)`
  width: 100%;
`;

interface FilterInputProps extends SearchBarInputProps {
  onCancel: () => void;
}

const FilterInput = forwardRef<HTMLInputElement, FilterInputProps>(
  ({ onCancel, ...props }, ref) => {
    return (
      <StyledSearchBar
        lowPriority
        onSubmit={(ev) => {
          ev.preventDefault();
        }}
      >
        <SearchBarInput {...props} ref={ref} />
        <button
          type="button"
          className="spot-search-bar__search-button"
          onClick={onCancel}
        >
          <SpotIcon className="spot-icon" name="close" />
        </button>
      </StyledSearchBar>
    );
  }
);
