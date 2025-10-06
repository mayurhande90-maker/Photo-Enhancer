import { ImageProcessorView } from '@/components/image-processor-view';
import { features } from '@/lib/features';

export default function StudioPage() {
  const studioFeature = features.find((f) => f.name === 'Photo Studio');

  if (!studioFeature) {
    return <div>Feature not found.</div>;
  }

  return <ImageProcessorView feature={studioFeature} />;
}
