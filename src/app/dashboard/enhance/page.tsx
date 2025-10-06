import { ImageProcessorView } from '@/components/image-processor-view';
import { features } from '@/lib/features';

export default function EnhancePage() {
  const enhanceFeature = features.find((f) => f.name === 'Photo Enhancement');

  if (!enhanceFeature) {
    return <div>Feature not found.</div>;
  }

  return <ImageProcessorView feature={enhanceFeature} />;
}
