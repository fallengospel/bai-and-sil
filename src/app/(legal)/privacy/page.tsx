import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Bai and Sil',
  description: 'Privacy Policy for Bai and Sil marketplace',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">
            When you use Bai and Sil, we collect information that you provide directly and information 
            generated through your use of the Platform:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Account Information:</strong> Name, email address, phone number, and profile photo</li>
            <li><strong>Listing Information:</strong> Photos, descriptions, prices, and location details for items you list</li>
            <li><strong>Transaction Information:</strong> Communications with other users and transaction history</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
            <li><strong>Usage Data:</strong> Pages viewed, features used, and time spent on the Platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide, maintain, and improve the Platform</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Detect, investigate, and prevent fraudulent transactions and illegal activities</li>
            <li>Personalize your experience and provide relevant content</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
          <p className="mb-4">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Other Users:</strong> Your name and listings are visible to other users on the Platform</li>
            <li><strong>Service Providers:</strong> Third-party vendors who assist in operating the Platform</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
          <p className="mb-4">
            We use cookies and similar technologies to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Remember your preferences and settings</li>
            <li>Analyze how the Platform is used</li>
            <li>Provide personalized content and advertisements</li>
            <li>Prevent fraud and enhance security</li>
          </ul>
          <p className="mb-4">
            You can control cookies through your browser settings, but some features may not function 
            properly if cookies are disabled.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your personal 
            information against unauthorized access, alteration, disclosure, or destruction. However, 
            no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
          <p className="mb-4">
            We retain your personal information for as long as your account is active or as needed to 
            provide you services. We will also retain your information as necessary to comply with legal 
            obligations, resolve disputes, and enforce our agreements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access and receive a copy of your personal data</li>
            <li>Correct inaccurate personal data</li>
            <li>Request deletion of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p className="mb-4">
            To exercise these rights, please contact us at privacy@baiandsil.com.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p className="mb-4">
            The Platform is not intended for children under 18 years of age. We do not knowingly collect 
            personal information from children. If we become aware that we have collected personal 
            information from a child, we will take steps to delete such information promptly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page and updating the "Last Updated" date. Your 
            continued use of the Platform after any changes constitutes acceptance of the updated policy.
          </p>
        </section>
      </div>
    </div>
  );
}