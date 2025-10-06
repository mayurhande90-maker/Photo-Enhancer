# **App Name**: PhotoCraft AI

## Core Features:

- Photo Enhancement: Enhance photos by improving lighting, color, clarity while preserving faces and body shapes, using AI.  The AI tool will evaluate when the lighting, colors, noise and resolution requires to be improved.
- Background Removal: Remove photo backgrounds automatically using AI to create transparent PNGs with clean edges.
- Photo Studio (Product Enhancement): Enhance product photos by detecting the product type and enhancing the background, lighting, and color using AI. Packaging text and design are preserved, and the AI tool determines how to apply the product enhancement and decides on when it should be included.
- Photo Colorization: Colorize old black-and-white photos naturally and professionally using AI. Also enhances image quality by fixing blur or low resolution, the AI tool determines the level to which this should happen.
- User Authentication and Credits: User authentication using Firebase Auth (email, Google, Apple) and a credit system managed in Firestore. New users get 5 free credits.  Credits are deducted for each photo processing job. Tracks credits using Firestore.
- User Dashboard: Display remaining credits, subscription status, renewal info, and categorized folders (Enhancement, Background Removal, Studio, Colourise) for generated images. Allow users to view, download, and delete images.  Include before/after slider for enhancement and colourise features.
- Payment Integration and Subscription: Integrate Razorpay or Stripe for subscription payments and set up a webhook to verify payment and update credits/subscription. A monthly subscription plan will allow users to recharge 500 credits with monthly resets. Firebase Cloud functions handles the business logic of the payment verification.

## Style Guidelines:

- Primary color: Use a vibrant blue (#29ABE2) to convey trust and innovation.
- Background color: Light gray (#F0F2F5), nearly desaturated hue of the primary color, for a clean and modern feel.
- Accent color: A bright, saturated green (#90EE90) to highlight important actions and calls to action; contrasting, but harmonious, as green is 'to the left' of blue on the color wheel.
- Body and headline font: 'Inter', a sans-serif font for a modern and readable interface.
- Note: currently only Google Fonts are supported.
- Use clean and modern icons to represent different features and actions.
- A clean and intuitive layout with a 4-tab navigation for easy access to features.
- Subtle animations to provide feedback during image processing and navigation.