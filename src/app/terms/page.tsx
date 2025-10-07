
import { InfoPageLayout } from '@/components/info-page-layout';

export default function TermsAndConditionsPage() {
  return (
    <InfoPageLayout title="Terms and Conditions">
      <div className="space-y-6 text-muted-foreground">
        <p>
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p>
          Please read these Terms and Conditions ("Terms") carefully before using the Magicpixa website and services (the "Service") operated by Magicpixa ("us," "we," or "our"). Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service.
        </p>

        <h3 className="text-xl font-semibold text-foreground pt-4">1. Accounts</h3>
        <p>
          When you create an account with us, you guarantee that you are above the age of 18 and that the information you provide us is accurate, complete, and current at all times. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
        </p>

        <h3 className="text-xl font-semibold text-foreground pt-4">2. User Content</h3>
        <p>
          Our Service allows you to upload, store, and process images ("User Content"). You retain all rights to your User Content. By uploading User Content to the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and process this content solely for the purpose of providing and improving the Service for you. For example, we need this license to perform the AI operations you request on your images.
        </p>
        <p>
          You represent and warrant that: (i) you own the User Content or have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting of your User Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person.
        </p>
        <p>
          We do not claim any ownership rights over the images you generate using our AI tools. You own the output you create.
        </p>

        <h3 className="text-xl font-semibold text-foreground pt-4">3. Payments, Credits, and Subscriptions</h3>
        <p>
          Certain features of the Service are available on a credit-based or subscription basis.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Payments:</strong> We use Razorpay as our third-party payment processor. By making a purchase, you agree to Razorpay's terms and conditions. All payments are processed securely by Razorpay. We are not responsible for any errors or issues arising from the payment process.
          </li>
          <li>
            <strong>Credits:</strong> Credits are used to access specific AI features. The cost per feature is displayed within the application. Credits are non-refundable and must be used within the specified validity period, if any.
          </li>
          <li>
            <strong>Subscriptions:</strong> If you purchase a subscription, it will automatically renew at the end of each billing cycle unless you cancel it. You are responsible for all applicable taxes.
          </li>
          <li>
            <strong>Refunds:</strong> All purchases are final and non-refundable, except where required by law.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground pt-4">4. Acceptable Use</h3>
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Upload or generate any content that is unlawful, harmful, threatening, abusive, defamatory, obscene, or otherwise objectionable.</li>
          <li>Create content that infringes on any patent, trademark, trade secret, copyright, or other proprietary rights of any party.</li>
          <li>Generate content that promotes discrimination, bigotry, racism, hatred, harassment, or harm against any individual or group.</li>
          <li>Attempt to reverse-engineer, decompile, or otherwise discover the source code of the Service or the underlying AI models.</li>
        </ul>
        <p>We reserve the right to terminate your account for violating these acceptable use policies.</p>
        
        <h3 className="text-xl font-semibold text-foreground pt-4">5. Disclaimer and Limitation of Liability</h3>
        <p>
          The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, express or implied, regarding the accuracy, reliability, or completeness of the Service. The AI-generated content may sometimes contain inaccuracies or artifacts.
        </p>
        <p>
          In no event shall Magicpixa, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
        </p>
        
        <h3 className="text-xl font-semibold text-foreground pt-4">6. Governing Law</h3>
        <p>
          These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
        </p>
        
        <h3 className="text-xl font-semibold text-foreground pt-4">7. Changes to Terms</h3>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
        </p>
        
        <h3 className="text-xl font-semibold text-foreground pt-4">Contact Us</h3>
        <p>
          If you have any questions about these Terms, please contact us at: <a href="mailto:support@magicpixa.com" className="text-primary hover:underline">support@magicpixa.com</a>
        </p>
      </div>
    </InfoPageLayout>
  );
}
