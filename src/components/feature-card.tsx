import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: ImagePlaceholder;
}

export function FeatureCard({ icon, title, description, image }: FeatureCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
      {image && (
        <div className="relative h-40 w-full">
          <Image
            src={image.imageUrl}
            alt={image.description}
            fill
            className="object-cover"
            data-ai-hint={image.imageHint}
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-4">
            {icon}
            <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription className="pt-2">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
