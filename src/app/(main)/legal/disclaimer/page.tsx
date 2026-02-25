import React from 'react';
import Head from 'next/head';

const Disclaimer: React.FC = () => {
  return (
    <>
      <Head>
        <title>Disclaimer - Your Ecommerce Store</title>
        <meta name="description" content="Disclaimer for Your Ecommerce Store" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Disclaimer</h1>
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold mb-4">General Information</h2>
          <p className="mb-6">
            The information on this website is provided on "an as" is basis. To the fullest extent
            permitted by law, this company excludes all representations, warranties, conditions and
            terms whether express, implied, statutory or otherwise which might otherwise apply to
            our website or any content on it.
          </p>

          <h2 className="text-2xl font-semibold mb-4">No Warranties</h2>
          <p className="mb-4">
            We make no warranties or representations about the accuracy, reliability, completeness,
            currentness or timeliness of the content, information, software, text, graphics, and
            links on this website. Specifically, we disclaim:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Any warranties of merchantability or fitness for a particular purpose</li>
            <li>That our website will be available without interruption or error-free</li>
            <li>That any defects in our website will be corrected</li>
            <li>That our website or server is free from viruses or other harmful components</li>
            <li>The accuracy, reliability, or currency of any information provided</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">Product Information</h2>
          <h3 className="text-xl font-medium mb-2">Accuracy</h3>
          <p className="mb-4">
            While we strive to provide accurate product descriptions, specifications, pricing, and
            availability information, we cannot guarantee that all information is completely accurate,
            complete, or current. Product specifications and appearance may vary from those described
            or shown on the website.
          </p>

          <h3 className="text-xl font-medium mb-2">Pricing Errors</h3>
          <p className="mb-4">
            In the event of a pricing error, we reserve the right to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Cancel orders placed at incorrect prices</li>
            <li>Refuse or cancel orders regardless of confirmation</li>
            <li>Correct pricing errors and contact you with the correct price</li>
            <li>Limit quantities available at promotional prices</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">Product Availability</h3>
          <p className="mb-6">
            Product availability is subject to change without notice. We do not guarantee that any
            product will be available at the time of your order, even if shown as "in stock" on
            our website.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by applicable law, we exclude all liability and
            responsibility for any amount or kind of loss or damage that may result from:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Use of or reliance on information from this website</li>
            <li>Any inability to use this website</li>
            <li>Any interruption, suspension, or termination of service</li>
            <li>Any bugs, viruses, or other harmful components</li>
            <li>Loss of data, revenue, or profits</li>
            <li>Business interruption or any indirect, consequential, or incidental damages</li>
            <li>Any errors or omissions in content</li>
            <li>Actions or inactions of third parties</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">Third-Party Links and Content</h2>
          <p className="mb-4">
            Our website may contain links to third-party websites, products, or services. We are not
            responsible for:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>The content, accuracy, or opinions expressed on third-party websites</li>
            <li>The privacy practices of external sites</li>
            <li>Products or services offered by third parties</li>
            <li>Any transactions between you and third-party providers</li>
            <li>Any damages resulting from third-party content or services</li>
          </ul>
          <p className="mb-6">
            Links to external sites are provided for convenience only and do not constitute endorsement
            of the content or services provided by those sites.
          </p>

          <h2 className="text-2xl font-semibold mb-4">User-Generated Content</h2>
          <p className="mb-4">
            Our website may allow users to submit reviews, comments, or other content. We disclaim
            all liability for:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>The accuracy or reliability of user-submitted content</li>
            <li>Any offensive, inappropriate, or illegal content posted by users</li>
            <li>Any copyright or intellectual property infringement in user content</li>
            <li>Any damages resulting from reliance on user-generated content</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">Professional Advice</h2>
          <p className="mb-6">
            The information provided on this website is for general informational purposes only and
            should not be considered professional, legal, medical, or financial advice. Always consult
            with qualified professionals for specific advice related to your situation.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Health and Safety</h2>
          <p className="mb-4">
            For products that may affect health or safety:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Always read and follow all product instructions and warnings</li>
            <li>Consult healthcare providers before using health-related products</li>
            <li>We are not responsible for adverse reactions or misuse of products</li>
            <li>Keep products away from children unless specifically designed for them</li>
            <li>Discontinue use if you experience any adverse effects</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">Technical Issues</h2>
          <p className="mb-4">
            While we strive to maintain our website&apos;s functionality, we cannot guarantee:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Uninterrupted access to our website</li>
            <li>Error-free operation at all times</li>
            <li>Compatibility with all devices and browsers</li>
            <li>The security of data transmission over the internet</li>
            <li>Protection against all security threats or data breaches</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
          <p className="mb-6">
            While we respect intellectual property rights and make efforts to ensure we have proper
            rights to use content on our website, we cannot guarantee that all content is free from
            copyright or trademark infringement claims. Users should independently verify rights
            before using any content from our website.
          </p>

          <h2 className="text-2xl font-semibold mb-4">International Use</h2>
          <p className="mb-6">
            This website may be accessed internationally, but we make no representation that materials
            on this website are appropriate or available for use in locations outside of [Your Country].
            Users accessing this website from other jurisdictions do so at their own risk and are
            responsible for compliance with local laws.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Force Majeure</h2>
          <p className="mb-6">
            We shall not be liable for any failure to perform our obligations under any agreement with
            you if such failure results from conditions beyond our reasonable control, including but
            not limited to acts of God, natural disasters, war, terrorism, strikes, or government actions.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Changes to Products and Services</h2>
          <p className="mb-6">
            We reserve the right to modify, suspend, or discontinue any products, services, or features
            of our website at any time without prior notice. We are not liable for any such modifications,
            suspensions, or discontinuations.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Age Restrictions</h2>
          <p className="mb-6">
            Our website and services are intended for users who are at least 18 years old or the age
            of majority in their jurisdiction. We disclaim any liability for use by minors and recommend
            parental supervision for users under 18.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Updates to This Disclaimer</h2>
          <p className="mb-6">
            We may update this disclaimer from time to time without prior notice. Your continued use
            of our website after any changes constitutes acceptance of the updated disclaimer. It is
            your responsibility to review this disclaimer periodically.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Severability</h2>
          <p className="mb-6">
            If any provision of this disclaimer is found to be unenforceable or invalid, that provision
            will be limited or eliminated to the minimum extent necessary so that the remainder of this
            disclaimer will otherwise remain in full force and effect.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="mb-2">
            If you have any questions about this disclaimer, please contact us:
          </p>
          <ul className="list-none mb-6">
            <li>Email: legal@yourstore.com</li>
            <li>Address: [Your Business Address]</li>
            <li>Phone: [Your Phone Number]</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Important:</strong> This disclaimer is provided for general guidance only.
                  Please consult with legal professionals to ensure compliance with applicable laws
                  and regulations in your jurisdiction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Disclaimer;