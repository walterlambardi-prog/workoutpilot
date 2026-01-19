import { Image } from "expo-image";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import styles from "./explore.styles";
import { ExploreInfoItem } from "./explore.types";

const ExploreScreen: React.FC = () => {
  const { t } = useTranslation();

  const paragraphs = useCallback(
    (key: string) => (t(key, { returnObjects: true }) as string[]) ?? [],
    [t],
  );

  const infoItems: ExploreInfoItem[] = useMemo(() => {
    const routingParagraphs = paragraphs("explore.cards.routing.paragraphs");
    const platformParagraphs = paragraphs("explore.cards.platforms.paragraphs");
    const imageParagraphs = paragraphs("explore.cards.images.paragraphs");
    const themingParagraphs = paragraphs("explore.cards.theming.paragraphs");
    const animationParagraphs = paragraphs(
      "explore.cards.animations.paragraphs",
    );

    return [
      {
        title: t("explore.cards.routing.title"),
        content: (
          <>
            {routingParagraphs.map((text, index) => (
              <ThemedText key={`routing-${index}`}>{text}</ThemedText>
            ))}
          </>
        ),
      },
      {
        title: t("explore.cards.platforms.title"),
        content: (
          <>
            {platformParagraphs.map((text, index) => (
              <ThemedText key={`platform-${index}`}>{text}</ThemedText>
            ))}
          </>
        ),
      },
      {
        title: t("explore.cards.images.title"),
        content: (
          <>
            {imageParagraphs.map((text, index) => (
              <ThemedText key={`images-${index}`}>{text}</ThemedText>
            ))}
            <Image
              source={require("@/assets/images/react-logo.png")}
              style={{ width: 100, height: 100, alignSelf: "center" }}
            />
            <ExternalLink href="https://reactnative.dev/docs/images">
              <ThemedText type="link">{t("explore.links.images")}</ThemedText>
            </ExternalLink>
          </>
        ),
      },
      {
        title: t("explore.cards.theming.title"),
        content: (
          <>
            {themingParagraphs.map((text, index) => (
              <ThemedText key={`theming-${index}`}>{text}</ThemedText>
            ))}
            <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
              <ThemedText type="link">
                {t("explore.links.themesGuide")}
              </ThemedText>
            </ExternalLink>
          </>
        ),
      },
      {
        title: t("explore.cards.animations.title"),
        content: (
          <>
            {animationParagraphs[0] ? (
              <ThemedText key="animation-0">
                {animationParagraphs[0]}
              </ThemedText>
            ) : null}
            {Platform.OS === "ios" && animationParagraphs[1] ? (
              <ThemedText key="animation-1">
                {animationParagraphs[1]}
              </ThemedText>
            ) : null}
          </>
        ),
      },
    ];
  }, [paragraphs, t]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}
        >
          {t("explore.title")}
        </ThemedText>
      </ThemedView>

      {infoItems.map((item) => (
        <Collapsible key={item.title} title={item.title}>
          {item.content}
        </Collapsible>
      ))}
    </ParallaxScrollView>
  );
};

export default ExploreScreen;
