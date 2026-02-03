import React from "react";

import { TActionCard } from "@/components/TActionCard";
import { TGrid } from "@/components/TGrid";
import { TPage } from "@/components/TPage";
import { TWelcomeHeader } from "@/components/TWelcomeHeader";

import { useHome } from "./hooks/useHome";

const HomeScreen: React.FC = () => {
  const { headerTitle, headerSubtitle, headerDescription, actionCards } =
    useHome();

  return (
    <TPage backgroundColor="$background" hasHeader>
      <TWelcomeHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        description={headerDescription}
        showWave
      />

      <TGrid columns={3} gap="$4">
        {actionCards.map((action) => (
          <TActionCard
            key={action.key}
            title={action.title}
            description={action.description}
            icon={action.icon}
            iconColor={action.color}
            accessibilityHint={action.accessibilityHint}
            onPress={action.onPress}
          />
        ))}
      </TGrid>
    </TPage>
  );
};

export default HomeScreen;
