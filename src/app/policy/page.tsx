
import { InfoPageLayout } from '@/components/info-page-layout';

export default function PrivacyPolicyPage() {
  return (
    <InfoPageLayout title="Privacy Policy">
      <div className="space-y-6 text-muted-foreground">
        <p>
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p>
          Magicpixa ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (the "Services"). Please read this Privacy Policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
        </p>

        <h3 className="text-xl font-semibold text-foreground pt-4">1. Information We Collect</h3>
        <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Personal Data:</strong> When you register for an account, we collect personally identifiable information, such as your name, email address, and password. This information is necessary to create and manage your account and provide you with our Services.
          </li>
          <li>
            <strong>User-Generated Content:</strong> We collect the images and prompts you upload or submit for processing ("User Content"). This content is processed by our AI models to provide you with the requested image enhancement, removal, or generation services.
          </li>
          <li>
            <strong>Payment Data:</strong> When you purchase a subscription or credits, we use a third-party payment processor (Razorpay) to collect your payment information. We do not store or have direct access to your full payment card details. We only receive a transaction confirmation and order details from Razorpay to fulfill your purchase.
          </li>
          <li>
            <strong>Usage Data:</strong> We automatically collect information about how you use the Services, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the site. This data is used for analytics, to improve our Services, and for security purposes.
          </li>
          <li>
            <strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. This helps us personalize your experience and may be used for advertising purposes, including through third-party services like Google Ads.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground pt-4">2. How We Use Your Information</h3>
        <p>We use the information we collect for various purposes, including to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide, operate, and maintain our Services.</li>
          <li>Create and manage your account, including processing payments and managing your credit balance.</li>
          <li>Process your User Content to generate the AI-enhanced images you request.</li>
          <li>Improve, personalize, and expand our Services.</li>
          <li>Understand and analyze how you use our Services to enhance user experience.</li>
          <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes.</li>
          <li>Comply with legal obligations and enforce our terms and policies.</li>
          <li>Serve targeted advertisements through platforms like Google Ads based on your activity.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground pt-4">3. Sharing Your Information</h3>
        <p>We do not sell your personal information. We may share information we have collected about you in certain situations:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>With Service Providers:</strong> We share information with third-party vendors and service providers that perform services for us or on our behalf, such as AI model providers (e.g., Google AI), cloud hosting (e.g., Firebase), payment processing (e.g., Razorpay), and analytics services.
          </li>
          <li>
            <strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in the good faith belief that such action is necessary to comply with a legal obligation, protect and defend our rights or property, or in urgent circumstances to protect the personal safety of users or the public.
          </li>
          <li>
            <strong>For Advertising:</strong> We may share aggregated or de-identified information with third parties for advertising and marketing analysis, including with advertising partners like Google.
          </li>
        </ul>
        <p>Your uploaded images are sent to our AI service providers for the sole purpose of generating the output. We do not grant them rights to use your images for any other purpose.</p>

        <h3 className="text-xl font-semibold text-foreground pt-4">4. Your Data Rights</h3>
        <p>You have certain rights regarding your personal data. Depending on your location, these may include the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access the personal data we hold about you.</li>
          <li>Request that we correct any inaccurate personal data.</li>
          <li>Request that we delete your personal data.</li>
          <li>Object to or restrict our processing of your personal data.</li>
        </ul>
        <p>To exercise these rights, please contact us at <a href="mailto:support@magicpixa.com" className="text-primary hover:underline">support@magicpixa.com</a>.</p>

        <h3 className="text-xl font-semibold text-foreground pt-4">5. Data Security</h3>
        <p>
          We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
        </p>

        <h3 className="text-xl font-semibold text-foreground pt-4">6. Changes to This Privacy Policy</h3>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
        </p>

        <h3 className="text-xl font-semibold text-foreground pt-4">Contact Us</h3>
        <p>
          If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:support@magicpixa.com" className="text-primary hover:underline">support@magicpixa.com</a>
        </p>
      </div>
    </InfoPageLayout>
  );
}
