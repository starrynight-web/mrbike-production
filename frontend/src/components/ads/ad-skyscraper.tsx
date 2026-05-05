import { AdBase } from "./ad-base";

interface AdSkyscraperProps {
  forceVisible?: boolean;
}

export function AdSkyscraper({ forceVisible }: AdSkyscraperProps) {
  return (
    <AdBase
      width={160}
      height={600}
      label="Skyscraper"
      forceVisible={forceVisible}
    />
  );
}
