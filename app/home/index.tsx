import React from "react";
import { useTranslation } from "react-i18next";
import { YStack } from "tamagui";

import { TNextActionCard } from "@/components/TNextActionCard";
import { TPage } from "@/components/TPage";
import { TStreakCard } from "@/components/TStreakCard";
import { TTodayStatsCard } from "@/components/TTodayStatsCard";
import { TWeeklyProgressCard } from "@/components/TWeeklyProgressCard";
import { useWeeklyProgress } from "@/components/TWeeklyProgressCard/hooks/useWeeklyProgress";
import { TWelcomeHeader } from "@/components/TWelcomeHeader";

import { useHome } from "./hooks/useHome";
import { useHomeStats } from "./hooks/useHomeStats";

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { headerTitle, headerSubtitle } = useHome();
  const { isSyncing, todayStats, streakInfo, nextAction } = useHomeStats();
  const weeklyProgress = useWeeklyProgress();

  return (
    <TPage scrollable backgroundColor="$background" hasHeader>
      <YStack gap="$5">
        {/* Welcome header */}
        <TWelcomeHeader
          title={headerTitle}
          subtitle={isSyncing ? t("sync.status.syncing") : headerSubtitle}
          showWave
        />

        {/* Next Action - Hero card */}
        <TNextActionCard nextAction={nextAction} />

        {/* Today's Stats */}
        <TTodayStatsCard stats={todayStats} />

        {/* Weekly Progress Dashboard */}
        <TWeeklyProgressCard data={weeklyProgress} />

        {/* Streak Info */}
        {streakInfo.currentStreak > 0 && (
          <TStreakCard streakInfo={streakInfo} />
        )}
      </YStack>
    </TPage>
  );
};

export default HomeScreen;
