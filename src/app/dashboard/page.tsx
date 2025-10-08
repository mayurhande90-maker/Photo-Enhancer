
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { features } from '@/lib/features';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Magicpixa</h1>
        <p className="text-muted-foreground mt-2">
          Choose a tool below to start bringing your photos to life.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {features.slice(0, 20).map((feature) => (
          <Link href={feature.path} key={feature.name} className="h-full">
            <Card className="h-full flex flex-col rounded-3xl transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg hover:shadow-brand-accent/20 group">
              <CardHeader className="items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 text-brand-primary group-hover:from-brand-primary/30 group-hover:to-brand-secondary/30">
                  <feature.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-base font-semibold">{feature.name}</CardTitle>
                <CardDescription className="text-xs">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex justify-center pb-4">
                  <span className="text-sm font-medium text-brand-accent group-hover:underline">Try Now →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
