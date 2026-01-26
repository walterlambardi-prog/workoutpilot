import { YStackProps } from "tamagui";

export interface TPageProps extends YStackProps {
  children: React.ReactNode;
  scrollable?: boolean;
  showsVerticalScrollIndicator?: boolean;
}
