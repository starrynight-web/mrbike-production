import { AdBase } from "./ad-base";

interface AdBannerProps {
  fullWidth?: boolean;
  forceVisible?: boolean;
}

export function AdBanner({ fullWidth, forceVisible }: AdBannerProps) {
  return (
    <AdBase
      width={728}
      height={90}
      label={fullWidth ? "Full-Width Banner" : "Banner / Leaderboard"}
      fullWidth={fullWidth}
      forceVisible={forceVisible}
    />
  );
}
