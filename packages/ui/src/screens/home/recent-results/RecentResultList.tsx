import {
  HomeScreenButton,
  HomeScreenButtonContainer,
  HomeScreenColumn,
  HomeScreenLabelContainer,
  HomeScreenScrollContent,
} from "../HomeScreenComponents";
import { useEffect, useState } from "react";
import { SpotText } from "@viewpoint/spot-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGetRecentResultsQuery } from "../../../api/ResultsApi";
import { RecentResultCard } from "./RecentResultCard";

export const TestId = {
  RecentResultList: "recent-result-list",
};

export function RecentResultList() {
  const [skipAnimations, setSkipAnimations] = useState(true);
  const { t } = useTranslation();
  const nav = useNavigate();

  const { data: recentResults } = useGetRecentResultsQuery(7);

  useEffect(() => {
    // Data has loaded -- we can do animations now when new results come in
    if (recentResults != null) {
      setSkipAnimations(false);
    }
  }, [recentResults]);

  return (
    <HomeScreenColumn>
      <HomeScreenLabelContainer>
        <SpotText level="h3">
          {t("home.labels.results", { count: recentResults?.length ?? 0 })}
        </SpotText>
      </HomeScreenLabelContainer>

      <HomeScreenButtonContainer>
        <HomeScreenButton
          leftIcon="search"
          onClick={() => nav("/patientSearch")}
        >
          {t("home.buttons.recordsSearch")}
        </HomeScreenButton>
      </HomeScreenButtonContainer>

      <HomeScreenScrollContent
        empty={(recentResults?.length ?? 0) === 0}
        data-testid={TestId.RecentResultList}
      >
        {recentResults?.map((result) => (
          <RecentResultCard
            key={result.labRequestId}
            result={result}
            onClick={() => nav(`/labRequest/${result.labRequestId}`)}
            skipAnimation={skipAnimations}
          />
        ))}
      </HomeScreenScrollContent>
    </HomeScreenColumn>
  );
}
