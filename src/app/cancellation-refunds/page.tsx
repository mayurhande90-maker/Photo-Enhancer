
import { InfoPageLayout } from '@/components/info-page-layout';

export default function CancellationRefundPolicyPage() {
  return (
    <InfoPageLayout title="Cancellation & Refund Policy">
      <div className="space-y-6 text-muted-foreground">
        <p>
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p>
          At Magicpixa, we are committed to providing our users with exceptional AI-powered image editing tools. We offer both a credit-based system and subscription plans to access our services. This policy outlines our terms regarding cancellations and refunds.
        </p>

        <h3 className="text-xl font-semibold text-foreground pt-4">1. General Policy</h3>
        <p>
          All purchases of credit packs and subscription plans are final. Due to the digital nature of our service and the immediate allocation of resources (like processing credits), we generally do not offer refunds or credits for partially used periods or accidental purchases once a transaction is completed.
        </p>

        <h3 className="text-xl font-semibold text-foreground pt-4">2. Subscription Cancellations</h3>
        <p>
          You can cancel your "Pro" subscription at any time. To cancel, please navigate to your account settings or contact our support team.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Effect of Cancellation:</strong> When you cancel a subscription, you will retain access to all "Pro" features until the end of your current billing period. You will not be charged for the next billing cycle.
          </li>
          <li>
            <strong>No Pro-rata Refunds:</strong> We do not provide refunds for the remaining time in your billing cycle after you cancel. For example, if you cancel a monthly subscription 10 days after your last payment, you will continue to have "Pro" access for the rest of the month, but you will not receive a refund for that remaining time.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground pt-4">3. Credit Packs</h3>
        <p>
          One-time purchases of credit packs are non-refundable. Once credits are added to your account, they cannot be converted back into cash. Unused credits will remain in your account until they are used, subject to any expiration terms that may be specified at the time of purchase.
        </p>

        <h3 className="text-xl font-semibold text-foreground pt-4">4. Exceptional Circumstances</h3>
        <p>
          We may consider refunds on a case-by-case basis under exceptional circumstances, such as a proven technical failure of our service that prevents you from using your purchase, or where required by consumer protection laws in your jurisdiction. To request a refund under such circumstances, you must contact our support team within 7 days of the transaction with a detailed explanation and any relevant evidence.
        </p>
        <p>
          We reserve the right to decline any refund request that does not meet these criteria.
        </p>

        <h3 className="text-xl font-semibold text-foreground pt-4">5. How to Contact Us</h3>
        <p>
          If you have any questions about our Cancellation and Refund Policy, or if you believe you are eligible for a refund under exceptional circumstances, please contact our support team at: <a href="mailto:support@magicpixa.com" className="text-primary hover:underline">support@magicpixa.com</a>.
        </p>
      </div>
    </InfoPageLayout>
  );
}
