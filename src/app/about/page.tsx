
import { InfoPageLayout } from '@/components/info-page-layout';

export default function AboutUsPage() {
  return (
    <InfoPageLayout title="About Magicpixa">
      <div className="space-y-6 text-muted-foreground">
        <p>
          Welcome to Magicpixa, where we believe that every photo holds a story waiting to be told, and every creator, professional or hobbyist, deserves the tools to tell it beautifully. We are a passionate team of developers, designers, and AI enthusiasts dedicated to making professional-grade photo editing accessible to everyone, everywhere.
        </p>
        <p>
          Our journey began with a simple question: "What if we could harness the power of artificial intelligence to simplify the most complex photo editing tasks?" We saw photographers, e-commerce owners, and social media creators spending hours on repetitive tasks—removing backgrounds, adjusting lighting, and preparing product shots. We knew there had to be a better, faster way.
        </p>
        <h3 className="text-xl font-semibold text-foreground pt-4">Our Mission</h3>
        <p>
          Our mission is to empower creativity by building intelligent, one-click tools that handle the technical work, so you can focus on your vision. We want to be your photo’s best friend—the reliable assistant that turns a good shot into a great one, a dull product image into a sales-driver, and a faded memory into a vibrant story.
        </p>
        <h3 className="text-xl font-semibold text-foreground pt-4">The Magic Behind the Pixels</h3>
        <p>
          Magicpixa is powered by cutting-edge generative AI models. Our custom-trained "Magic Engine" is the core of our platform, designed for speed, precision, and nuance. Whether it’s cleanly separating a subject from its background, realistically colorizing a black-and-white photo, or creating the perfect studio environment for a product, our AI understands context and delivers stunning, natural-looking results.
        </p>
        <h3 className="text-xl font-semibold text-foreground pt-4">Join Our Community</h3>
        <p>
          We are more than just a software company; we are a community of creators. We are constantly inspired by the incredible images our users create with Magicpixa, and we are committed to evolving our tools based on your feedback.
        </p>
        <p>
          Thank you for being part of our story. Now, let's go create some magic.
        </p>
        <p className="font-semibold text-foreground">
          — The Magicpixa Team
        </p>
      </div>
    </InfoPageLayout>
  );
}
