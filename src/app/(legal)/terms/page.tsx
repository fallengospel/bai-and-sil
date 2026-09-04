import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Bai and Sil',
  description: 'Terms of Service for Bai and Sil marketplace',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using Bai and Sil ("the Platform"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the Platform. We reserve the right to modify 
            these terms at any time, and your continued use of the Platform constitutes acceptance of any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
          <p className="mb-4">
            You must create an account to use certain features of the Platform. You are responsible for:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Providing accurate and complete information during registration</li>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use of your account</li>
          </ul>
          <p className="mb-4">
            You must be at least 18 years old to create an account. We reserve the right to suspend or 
            terminate accounts that violate these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Listings</h2>
          <p className="mb-4">
            When creating listings, you agree to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate descriptions and real photos of items</li>
            <li>Set fair and reasonable prices</li>
            <li>Only list items that you own and have the right to sell</li>
            <li>Not list prohibited items as outlined in Section 5</li>
            <li>Respond to inquiries in a timely manner</li>
          </ul>
          <p className="mb-4">
            We reserve the right to remove listings that violate our policies or that we deem inappropriate.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Transactions</h2>
          <p className="mb-4">
            Bai and Sil is a platform that connects buyers and sellers. We are not a party to any transaction 
            between users. You agree that:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>All transactions are between the buyer and seller directly</li>
            <li>We do not guarantee the quality, safety, or legality of items listed</li>
            <li>You are responsible for ensuring safe payment and delivery methods</li>
            <li>We strongly recommend meeting in public places for local transactions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Prohibited Items</h2>
          <p className="mb-4">
            The following items are prohibited from being listed on the Platform:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Weapons, ammunition, and explosives</li>
            <li>Drugs, drug paraphernalia, and controlled substances</li>
            <li>Stolen goods and counterfeit items</li>
            <li>Adult content and services</li>
            <li>Hazardous materials and chemicals</li>
            <li>Live animals</li>
            <li>Human remains or body parts</li>
            <li>Items that violate intellectual property rights</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
          <p className="mb-4">
            All content on the Platform, including logos, text, graphics, and software, is the property of 
            Bai and Sil or its licensors and is protected by intellectual property laws. You may not:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Copy, modify, or distribute any content without permission</li>
            <li>Use our trademarks or branding without authorization</li>
            <li>Scrape or collect data from the Platform using automated means</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by law, Bai and Sil shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages arising from your use of the Platform. 
            We do not warrant that the Platform will be uninterrupted or error-free.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Dispute Resolution</h2>
          <p className="mb-4">
            Any disputes arising from these terms or your use of the Platform shall be resolved through:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Good faith negotiation between the parties</li>
            <li>Mediation if negotiation fails</li>
            <li>Binding arbitration in the Philippines if mediation fails</li>
          </ul>
          <p className="mb-4">
            These terms shall be governed by and construed in accordance with the laws of the Philippines.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Modifications</h2>
          <p className="mb-4">
            We reserve the right to modify these Terms of Service at any time. We will notify users of 
            material changes via email or through the Platform. Your continued use of the Platform after 
            such changes constitutes acceptance of the modified terms.
          </p>
        </section>
      </div>
    </div>
  );
}