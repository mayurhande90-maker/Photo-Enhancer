
'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function CreationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Creations</h1>
                <p className="text-muted-foreground">
                    This feature is coming soon!
                </p>
            </div>
             <Alert>
                <ImageIcon className="h-4 w-4" />
                <AlertTitle>Feature Unavailable</AlertTitle>
                <AlertDescription>
                  The "My Creations" gallery requires user accounts to save images. Since authentication is currently disabled, this feature is not available.
                  Go back to the <Link href="/dashboard" className='underline'>dashboard</Link>.
                </AlertDescription>
            </Alert>
        </div>
    )
}
