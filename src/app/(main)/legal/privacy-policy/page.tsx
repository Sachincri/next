import React from 'react';
import Head from 'next/head';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - Your Ecommerce Store</title>
        <meta name="description" content="Privacy Policy for Your Ecommerce Store" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <h3 className="text-xl font-medium mb-2">Personal Information</h3>
          <p className="mb-4">
            We collect information you provide directly to us, such as when you create an account, make a purchase,
            subscribe to our newsletter, or contact us. This may include:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Name and contact information (email, phone, address)</li>
            <li>Payment information (credit card details, billing address)</li>
            <li>Account credentials (username, password)</li>
            <li>Purchase history and preferences</li>
            <li>Communications with our support team</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">Automatically Collected Information</h3>
          <p className="mb-4">
            When you visit our website, we automatically collect certain information about your device and usage:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>IP address and location data</li>
            <li>Browser type and version</li>
            <li>Pages viewed and time spent on site</li>
            <li>Referring website information</li>
            <li>Cookie and tracking data</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Process and fulfill your orders</li>
            <li>Provide customer support</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Improve our products and services</li>
            <li>Personalize your shopping experience</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Prevent fraud and ensure security</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
          <p className="mb-4">We may share your information with:</p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Service Providers:</strong> Payment processors, shipping companies, email services</li>
            <li><strong>Business Partners:</strong> With your consent for joint marketing efforts</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
          </ul>
          <p className="mb-6">We do not sell your personal information to third parties.</p>

          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="mb-6">
            We implement appropriate security measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular
            security assessments.
          </p>

          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Opt-out of marketing communications</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
          <p className="mb-6">
            We use cookies and similar technologies to enhance your browsing experience, analyze site traffic,
            and serve personalized content. You can control cookie settings through your browser preferences.
          </p>

          <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
          <p className="mb-6">
            Our services are not intended for children under 13. We do not knowingly collect personal
            information from children under 13.
          </p>

          <h2 className="text-2xl font-semibold mb-4">8. International Transfers</h2>
          <p className="mb-6">
            Your information may be transferred to and processed in countries other than your own.
            We ensure appropriate safeguards are in place for such transfers.
          </p>

          <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
          <p className="mb-6">
            We may update this privacy policy from time to time. We will notify you of any material
            changes by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
          <p className="mb-2">If you have questions about this privacy policy, please contact us:</p>
          <ul className="list-none mb-6">
            <li>Email: privacy@yourstore.com</li>
            <li>Address: [Your Business Address]</li>
            <li>Phone: [Your Phone Number]</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;