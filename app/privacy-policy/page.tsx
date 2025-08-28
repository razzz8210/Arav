import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - Cracked AI',
  description: 'Privacy Policy for Cracked AI LLC',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-right mb-8">Effective Date: 06/06/2025</p>
          
          <p className="mb-6">
            Cracked AI LLC ("Cracked AI," "we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our platform, cracked.ai (the "Services"), including our AI-powered website builder and marketing content generation tools (videos, reels, carousels, etc.).
          </p>
          <p className="mb-12">
            By accessing or using cracked.ai, you agree to the practices described in this Privacy Policy. If you do not agree, please discontinue use of our Services.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
          <p className="mb-4">We may collect the following types of information:</p>
          
          <h3 className="text-xl font-medium mt-6 mb-2">a. Information You Provide</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, phone number, company details, billing information, and login credentials.</li>
            <li><strong>User Content:</strong> Content you upload, input, or generate using cracked.ai (text, images, videos, audio, website data).</li>
            <li><strong>Payment Information:</strong> Processed securely through third-party providers; we do not store credit/debit card details directly.</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-2">b. Information Collected Automatically</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Usage Data:</strong> IP address, browser type, device information, operating system, access times, and activity logs.</li>
            <li><strong>Cookies & Tracking:</strong> We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content.</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-2">c. Third-Party Integrations</h3>
          <p className="mb-8">
            If you connect cracked.ai with third-party platforms (e.g., TikTok, Meta, or other social media accounts), we may collect information authorized by you through their APIs, in accordance with their policies.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">How We Use Your Information</h2>
          <p className="mb-4">We use collected information to:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>Provide, operate, and improve our Services.</li>
            <li>Personalize user experiences and generate AI-driven outputs.</li>
            <li>Process payments and manage subscriptions.</li>
            <li>Communicate with you (e.g., updates, customer support, marketing messages).</li>
            <li>Ensure platform security, prevent fraud, and enforce compliance with our Terms & Conditions.</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Sharing and Disclosure</h2>
          <p className="mb-4">We do not sell or rent your personal data. We may share information in the following cases:</p>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li><strong>Service Providers:</strong> With trusted third-party vendors who support our Services (e.g., payment processors, hosting providers, analytics tools).</li>
            <li><strong>Third-Party Integrations:</strong> When you authorize us to connect with platforms like TikTok, Meta, or other partners.</li>
            <li><strong>Legal Requirements:</strong> When required to comply with laws, regulations, or government requests.</li>
            <li><strong>Business Transfers:</strong> In case of a merger, acquisition, or sale of assets, your information may be transferred.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Data Retention</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>We retain personal information only as long as necessary to provide Services, comply with legal obligations, and resolve disputes.</li>
            <li>AI-generated outputs may be stored temporarily to enhance service performance and user experience.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Security of Information</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2">
            <li>We implement industry-standard measures (encryption, access controls, monitoring) to safeguard your data.</li>
            <li>However, no online service can guarantee absolute security, and you acknowledge that you use cracked.ai at your own risk.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Your Rights and Choices</h2>
          <p className="mb-4">
            Depending on your jurisdiction, you may have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Access, update, or delete your personal data.</li>
            <li>Opt out of marketing communications.</li>
            <li>Restrict or object to certain processing activities.</li>
            <li>Request a copy of your data in portable format.</li>
          </ul>
          <p className="mb-8">To exercise these rights, contact us at <a href="mailto:privacy@cracked.ai" className="text-blue-500 hover:underline">privacy@cracked.ai</a>.</p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Children's Privacy</h2>
          <p className="mb-8">
            cracked.ai is not intended for individuals under 18 years of age. We do not knowingly collect personal data from children. If we discover that we have collected data from a minor, we will delete it immediately.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">International Data Transfers</h2>
          <p className="mb-8">
            If you access cracked.ai from outside the United States, your information may be transferred, stored, and processed in the U.S. or other jurisdictions. By using our Services, you consent to such transfers in accordance with applicable laws.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Changes to This Policy</h2>
          <p className="mb-8">
            We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised "Effective Date." Continued use of the Services after changes constitutes acceptance of the updated policy.
          </p>

          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-semibold mb-6">Contact Us</h2>
            <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at:</p>
            <p className="mb-2">Email: <a href="mailto:privacy@cracked.ai" className="text-blue-500 hover:underline">team@cracked.ai</a></p>
            <p className="mb-2">Mailing Address: Cracked AI LLC, 1401 Lavaca, #959, Austin, TX 78701, USA</p>
            <p>Last Updated: June 6, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
