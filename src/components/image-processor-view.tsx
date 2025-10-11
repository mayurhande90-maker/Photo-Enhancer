
'use client';

import { features } from '@/lib/features';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export function ImageProcessorView({ featureName }: { featureName: string }) {
  const feature = features.find((f) => f.name === featureName);
  
  if (!feature) {
    return <div>Feature not found.</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
        <section>
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
                        <feature.icon className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{feature.name}</h1>
                </div>
                <p className="mt-4 max-w-2xl text-muted-foreground">{feature.description}</p>
            </div>
        </section>

        <div className="h-px w-full bg-border" />

        <section>
            <h2 className="text-2xl font-semibold mb-4">Try It Yourself</h2>
            
             <Alert variant="destructive" className="rounded-2xl">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Feature Disabled</AlertTitle>
                <AlertDescription>
                    This feature's functionality is currently disabled. The UI below is a visual placeholder.
                </AlertDescription>
            </Alert>
        </section>
    </div>
  );
}
