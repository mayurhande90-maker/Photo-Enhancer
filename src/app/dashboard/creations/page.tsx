
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const renderEmptyState = () => (
    <div className="text-center border-2 border-dashed rounded-3xl p-12 space-y-4">
       <div className="mx-auto w-fit bg-primary/10 p-4 rounded-2xl text-primary">
           <ImageIcon className="h-10 w-10" />
       </div>
       <h2 className="text-xl font-semibold">Creations Are Disabled</h2>
       <p className="text-muted-foreground max-w-md mx-auto">
         This feature is currently disabled. Your generated images would appear here.
       </p>
       <Button asChild className="rounded-2xl" disabled>
           <div className="cursor-not-allowed">Start Creating</div>
       </Button>
   </div>
);

export default function CreationsPage() {
    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">My Creations</h1>
                    <p className="text-muted-foreground mt-2">
                        All your AI-generated magic in one place.
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search creations..." className="pl-9 w-full rounded-2xl" disabled />
                    </div>
                </div>
            </div>
            
            {renderEmptyState()}
        </div>
    );
}
