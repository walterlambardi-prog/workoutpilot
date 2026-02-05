import React from "react";
import { YStack } from "tamagui";

import ActivityHeatmap from "@/components/ActivityHeatmap";
import { TAchievementCard } from "@/components/TAchievementCard";
import { TNextActionCard } from "@/components/TNextActionCard";
import { TPage } from "@/components/TPage";
import { TStreakCard } from "@/components/TStreakCard";
import { TTodayStatsCard } from "@/components/TTodayStatsCard";
import { TWelcomeHeader } from "@/components/TWelcomeHeader";

import { useHome } from "./hooks/useHome";
import { useHomeStats } from "./hooks/useHomeStats";

const HomeScreen: React.FC = () => {
  const { headerTitle, headerSubtitle } = useHome();
  const { todayStats, streakInfo, nextAction, latestAchievement } =
    useHomeStats();

  return (
    <TPage scrollable backgroundColor="$background" hasHeader>
      <YStack gap="$5">
        {/* Welcome header */}
        <TWelcomeHeader
          title={headerTitle}
          subtitle={headerSubtitle}
          showWave
        />

        {/* Next Action - Hero card */}
        <TNextActionCard nextAction={nextAction} />

        {/* Today's Stats */}
        <TTodayStatsCard stats={todayStats} />

        {/* Streak Info */}
        {streakInfo.currentStreak > 0 && (
          <TStreakCard streakInfo={streakInfo} />
        )}

        {/* Latest Achievement */}
        {latestAchievement && (
          <TAchievementCard achievement={latestAchievement} />
        )}

        {/* Activity Heatmap */}
        {streakInfo.activeDays.length > 0 && <ActivityHeatmap />}
      </YStack>
    </TPage>
  );
};

export default HomeScreen;
