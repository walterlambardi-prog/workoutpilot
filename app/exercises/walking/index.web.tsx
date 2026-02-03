import React from "react";
import { useTranslation } from "react-i18next";
import { XStack, YStack } from "tamagui";

import MapView from "@/components/MapView";
import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TCard } from "@/components/TCard";
import { TPage } from "@/components/TPage";
import { THeading, TText } from "@/components/TText";

import { useWalkingSession } from "./hooks/useWalkingSession";
import styles from "./walking.styles";

const WalkingWebScreen: React.FC = () => {
  const { t } = useTranslation();
  const {
    status,
    errorMessage,
    positions,
    stats,
    startTracking,
    stopTracking,
  } = useWalkingSession();

  const statusLabel = t(`walking.status.${status}`);
  const primaryCtaLabel =
    status === "tracking"
      ? t("walking.actions.stop")
      : t("walking.actions.start");

  return (
    <TPage scrollable hasHeader>
      <ScreenHeader
        title={t("walking.title")}
        subtitle={t("walking.subtitleWeb")}
      />

      <TCard padding="$4">
        <YStack gap="$2">
          <TText variant="label">{t("walking.status.label")}</TText>
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
        <TText variant="label">{t("walking.map.title")}</TText>
        <TCard padding="$1">
          <MapView positions={positions} style={styles.mapWrapper} />
        </TCard>
      </YStack>
    </TPage>
  );
};

export default WalkingWebScreen;
