import React from "react";
import { useTranslation } from "react-i18next";
import { XStack, YStack } from "tamagui";

import MapView from "@/components/MapView";
import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TCard } from "@/components/TCard";
import { TPage } from "@/components/TPage";
import { THeading, TText } from "@/components/TText";

import { useStepTrackerSession } from "./hooks/useStepTrackerSession.web";
import styles from "./stepTracker.styles";

const StepTrackerWebScreen: React.FC = () => {
  const { t } = useTranslation();
  const {
    status,
    errorMessage,
    positions,
    stats,
    startTracking,
    stopTracking,
  } = useStepTrackerSession();

  const statusLabel = t(`stepTracker.status.${status}`);
  const primaryCtaLabel =
    status === "tracking"
      ? t("stepTracker.actions.stop")
      : t("stepTracker.actions.start");

  return (
    <TPage scrollable hasHeader>
      <ScreenHeader
        title={t("stepTracker.title")}
        subtitle={t("stepTracker.subtitleWeb")}
      />

      <TCard padding="$4">
        <YStack gap="$2">
          <TText variant="label">{t("stepTracker.status.label")}</TText>
          <THeading level={3}>{statusLabel}</THeading>
          {errorMessage ? (
            <TText color={"$red10" as any}>{errorMessage}</TText>
          ) : null}
          <TButton
            onPress={status === "tracking" ? stopTracking : startTracking}
            iconName={status === "tracking" ? "pause" : "walk"}
            disabled={status === "requesting"}
          >
            {primaryCtaLabel}
          </TButton>
        </YStack>
      </TCard>

      <XStack gap="$3" flexWrap="wrap">
        {stats.map((stat) => (
          <TCard key={stat.key} padding="$4" style={styles.statCard}>
            <YStack gap="$1">
              <TText variant="label">{stat.label}</TText>
              <THeading level={3}>{stat.value}</THeading>
            </YStack>
          </TCard>
        ))}
      </XStack>

      <YStack gap="$2">
        <TText variant="label">{t("stepTracker.map.title")}</TText>
        <TCard padding="$1">
          <MapView positions={positions} style={styles.mapWrapper} />
        </TCard>
      </YStack>
    </TPage>
  );
};

export default StepTrackerWebScreen;
