import { ImageProcessorView } from '@/components/image-processor-view';
import { features } from '@/lib/features';

export default function ColorizePage() {
  const colorizeFeature = features.find((f) => f.name === 'Photo Colorize');

  if (!colorizeFeature) {
    return <div>Feature not found.</div>;
  }

  return <ImageProcessorView feature={colorizeFeature} />;
}
