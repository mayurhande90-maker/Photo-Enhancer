
'use client'

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { features, featureCategories } from '@/lib/features';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo } from 'react';
import { ImageIcon, Megaphone, Briefcase, Sparkles, Star as StarIcon } from 'lucide-react';


const categoryIcons = {
  [featureCategories.IMAGE_STUDIO]: ImageIcon,
  [featureCategories.CONTENT_BRAND]: Megaphone,
  [featureCategories.SMART_OFFICE]: Briefcase,
  [featureCategories.PERSONAL_MAGIC]: Sparkles,
  [featureCategories.PREMIUM]: StarIcon,
};


export default function DashboardPage() {
  const categories = Object.values(featureCategories);
  const categorizedFeatures = useMemo(() => {
    return categories.map(category => ({
      name: category,
      features: features.filter(f => f.category === category)
    }));
  }, [categories]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Magicpixa</h1>
        <p className="text-muted-foreground mt-2">
          Choose a tool below to start bringing your photos to life.
        </p>
      </div>

       <Tabs defaultValue={featureCategories.IMAGE_STUDIO} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto rounded-2xl p-2">
            {categories.map(category => {
              const CategoryIcon = categoryIcons[category];
              return (
                <TabsTrigger key={category} value={category} className="flex gap-2 items-center rounded-xl py-2 data-[state=active]:shadow-md">
                  <CategoryIcon className="h-4 w-4"/>
                  {category}
                </TabsTrigger>
              )
            })}
          </TabsList>
          
          {categorizedFeatures.map(({name, features: categoryFeatures}) => (
            <TabsContent key={name} value={name} className="mt-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {categoryFeatures.map((feature) => (
                  <Link href={feature.isComingSoon || feature.isPremium ? '#' : feature.path} key={feature.name} className={cn("h-full", (feature.isComingSoon || feature.isPremium) && 'pointer-events-none')}>
                    <Card className="h-full flex flex-col rounded-3xl transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg hover:shadow-brand-accent/20 group relative overflow-hidden">
                      {(feature.isComingSoon || feature.isPremium) && (
                        <Badge variant={feature.isPremium ? "default" : "secondary"} className={cn("absolute top-4 right-4 z-10", feature.isPremium && "bg-gradient-to-r from-yellow-400 to-orange-500 text-white")}>
                          {feature.isPremium ? 'Premium' : 'Coming Soon'}
                        </Badge>
                      )}
                      <CardHeader className="items-center text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 text-brand-primary group-hover:from-brand-primary/30 group-hover:to-brand-secondary/30">
                          <feature.icon className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-base font-semibold">{feature.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center text-xs text-muted-foreground flex-1">
                        {feature.description}
                      </CardContent>
                      <CardFooter className="mt-auto flex justify-center pb-4">
                          <span className={cn("text-sm font-medium text-brand-accent group-hover:underline", (feature.isComingSoon || feature.isPremium) && 'opacity-50')}>Try Now →</span>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
    </div>
  );
}
