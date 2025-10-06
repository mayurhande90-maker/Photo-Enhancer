import { ImageProcessorView } from '@/components/image-processor-view';
import { features } from '@/lib/features';

export default function BackgroundRemovalPage() {
  const bgRemovalFeature = features.find((f) => f.name === 'Background Removal');

  if (!bgRemovalFeature) {
    return <div>Feature not found.</div>;
  }

  return <ImageProcessorView feature={bgRemovalFeature} />;
}
