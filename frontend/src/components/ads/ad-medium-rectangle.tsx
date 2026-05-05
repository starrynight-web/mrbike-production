import { AdBase } from "./ad-base";

interface AdMediumRectangleProps {
  forceVisible?: boolean;
}

export function AdMediumRectangle({ forceVisible }: AdMediumRectangleProps) {
  return (
    <AdBase
      width={300}
      height={250}
      label="Medium Rectangle"
      forceVisible={forceVisible}
    />
  );
}
