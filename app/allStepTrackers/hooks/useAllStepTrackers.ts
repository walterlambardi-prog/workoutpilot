import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { useStepTrackerStore } from "@/stores/stepTrackerStore";

import {
    formatDate,
    formatDuration,
    formatNumber,
} from "../../sessions/hooks/useSessions";

export const useAllStepTrackers = () => {
  const { t } = useTranslation();

  const stepTrackerHistoryFull = useStepTrackerStore((state) => state.history);

  const formatDistance = useCallback(
    (distanceKm: number) =>
      t("stepTracker.stats.distanceValue", { distance: distanceKm.toFixed(2) }),
    [t],
  );

  return {
    stepTrackerHistoryFull,
    formatDistance,
    formatDate,
    formatDuration,
    formatNumber,
  };
};
