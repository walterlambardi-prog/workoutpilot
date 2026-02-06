import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Card, Image, Text, XStack, YStack } from "tamagui";

import ScreenHeader from "@/components/ScreenHeader";
import { TGrid } from "@/components/TGrid";
import { TPage } from "@/components/TPage";
import { Spacing } from "@/constants/theme";

import { useTutorial } from "./hooks/useTutorial";

const TutorialScreen: React.FC = () => {
  const { tutorials, handleTutorialPress, t, media } = useTutorial();

  return (
    <TPage hasHeader>
      <YStack gap={Spacing.xxl}>
        <ScreenHeader
          title={t("tutorial.title")}
          subtitle={t("tutorial.subtitle")}
        />

        <TGrid columns={media.gtSm ? 2 : 1} gap="$4">
          {tutorials.map((tutorial) => (
            <Card
              key={tutorial.id}
              bordered
              elevate={false}
              padding={0}
              overflow="hidden"
              backgroundColor="$backgroundHover"
              onPress={() => handleTutorialPress(tutorial.route)}
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              animation="quick"
              hoverStyle={{
                elevation: "$3",
                scale: 1.02,
                borderColor: "$primary",
              }}
            >
              <Image
                source={tutorial.image}
                style={{
                  width: "100%",
                  height: media.gtSm ? 450 : 300,
                }}
                resizeMode="cover"
              />

              <YStack padding="$4" gap="$3">
                <YStack gap="$2">
                  <Text fontSize="$6" fontWeight="700" color="$color">
                    {t(tutorial.titleKey)}
                  </Text>
                  <Text
                    fontSize="$4"
                    color="$color"
                    opacity={0.8}
                    numberOfLines={3}
                  >
                    {t(tutorial.descriptionKey)}
                  </Text>
                </YStack>

                <XStack
                  alignItems="center"
                  gap="$2"
                  marginTop="$3"
                  paddingTop="$3"
                  borderTopWidth={1}
                  borderColor="$borderColor"
                  opacity={0.9}
                >
                  <Text fontSize="$5" fontWeight="700" color="$primary">
                    {t("tutorial.viewGuide")}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="$primary" />
                </XStack>
              </YStack>
            </Card>
          ))}
        </TGrid>
      </YStack>
    </TPage>
  );
};

export default TutorialScreen;
