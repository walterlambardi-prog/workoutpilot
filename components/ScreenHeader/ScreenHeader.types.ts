export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  titleShadow?: {
    color?: string;
    radius?: number;
    offset?: {
      width?: number;
      height?: number;
    };
  };
  align?: "left" | "center";
}
