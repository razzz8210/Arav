import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service - Cracked AI',
  description: 'Terms and Conditions for Cracked AI LLC',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Terms and Conditions</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-right mb-8">Last Updated: 06/06/2025</p>
          
          <p className="mb-6">
            Welcome to Cracked AI LLC ("we," "our," "us"). These Terms and Conditions ("Terms") govern your access to and use of our platform, applications, products, and services, including but not limited to AI-powered website creation, marketing content generation (videos, reels, Carousal, etc.), and related features (collectively, the "Services"). By accessing or using Crack AI LLC, you ("User," "you," or "your") agree to be bound by these Terms. If you do not agree, you may not use our Services.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Eligibility</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>You must be at least 16 years old or the legal age of majority in your jurisdiction to use Cracked AI LLC.</li>
            <li>By using our Services, you represent and warrant that you have the legal capacity and authority to enter into this agreement.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Use of Services</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Cracked AI LLC grants you a limited, non-exclusive, non-transferable license to use the Services in accordance with these Terms.</li>
            <li>You agree not to use our Services for any unlawful, harmful, or abusive purposes, including but not limited to:</li>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Creating or distributing illegal, defamatory, obscene, or infringing content.</li>
              <li>Misrepresenting ownership of AI-generated outputs.</li>
              <li>Violating the rights of others, including intellectual property, privacy, or publicity rights.</li>
            </ul>
            <li>You are responsible for maintaining the confidentiality of your account credentials and all activities under your account.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">User Content and AI-Generated Content</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Any content you upload, input, or generate through Cracked AI LLC ("User Content") remains your responsibility.</li>
            <li>You retain ownership of your User Content. However, by using our Services, you grant Cracked AI LLC a worldwide, non-exclusive, royalty-free license to use, host, store, reproduce, and display your User Content solely for the purpose of operating and improving our Services.</li>
            <li>AI-generated outputs may be unique, but Cracked AI LLC does not guarantee exclusivity of generated content. Similar or identical outputs may be produced for other users.</li>
            <li>You are solely responsible for ensuring that your use of AI-generated outputs complies with applicable laws and third-party rights.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Intellectual Property</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>All rights, title, and interest in the Cracked AI LLC platform, including software, design, logos, trademarks, and technology, are owned by or licensed to Cracked AI LLC.</li>
            <li>Except as expressly permitted, you may not copy, modify, distribute, sell, or lease any part of our Services or reverse-engineer our software.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Payments and Subscriptions</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Certain features of Cracked AI LLC may require payment. All fees, subscription plans, and billing terms will be disclosed at the time of purchase.</li>
            <li>Payments are non-refundable except where required by law.</li>
            <li>Crack.AI reserves the right to change pricing or subscription models with prior notice.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Third-Party Integrations</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Our Services may integrate with third-party platforms (e.g., TikTok, Meta, social media APIs). By connecting your account, you authorize Cracked AI LLC to interact with these platforms on your behalf.</li>
            <li>Cracked AI LLC is not responsible for third-party services, their policies, or their availability.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Prohibited Activities</h2>
          <p className="mb-4">You agree not to use Cracked AI LLC for:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Spamming, fraudulent marketing, or misleading advertising.</li>
            <li>Generating harmful or exploitative content (e.g., violence, hate speech, adult content, misinformation).</li>
            <li>Circumventing security or interfering with our platform.</li>
          </ul>
          <p className="mb-8">Violation of these restrictions may result in suspension or termination of your account.</p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Disclaimers and Limitation of Liability</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Cracked AI LLC provides its Services "as is" and "as available" without warranties of any kind.</li>
            <li>We do not guarantee uninterrupted, error-free, or secure operation of the Services.</li>
            <li>To the maximum extent permitted by law, Cracked AI LLC is not liable for any indirect, incidental, or consequential damages arising out of your use of the Services.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Termination</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>You may stop using the Services at any time.</li>
            <li>Cracked AI LLC may suspend or terminate your account at its discretion if you violate these Terms or misuse the Services.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Privacy</h2>
          <p className="mb-8">
            Your use of Cracked AI LLC is also governed by our <Link href="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</Link>, which explains how we collect, use, and protect your personal data.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Governing Law</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>These Terms shall be governed by and construed in accordance with the laws of Austin, Texas.</li>
            <li>Any disputes shall be subject to the exclusive jurisdiction of the courts in Austin, Texas.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Changes to Terms</h2>
          <p className="mb-8">
            Cracked AI LLC may update these Terms at any time. We will notify users of material changes by posting updates on our platform or sending communications. Continued use of the Services after changes means acceptance of the revised Terms.
          </p>

          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-semibold mb-6">Contact Us</h2>
            <p className="mb-4">If you have any questions about these Terms, please contact us at:</p>
            <p className="mb-2">Email: <a href="mailto:privacy@cracked.ai" className="text-blue-500 hover:underline">team@cracked.ai</a></p>
            <p className="mb-2">Mailing Address: Cracked AI LLC, 1401 Lavaca, #959, Austin, TX 78701, USA</p>
            <p>Website: <a href="https://cracked.ai" className="text-blue-500 hover:underline">https://cracked.ai</a></p>
            <p className="mt-4">Last Updated: June 6, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}