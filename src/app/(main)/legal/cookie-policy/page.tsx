import React from 'react';
import Head from 'next/head';

const CookiePolicy: React.FC = () => {
  return (
    <>
      <Head>
        <title>Cookie Policy - Your Ecommerce Store</title>
        <meta name="description" content="Cookie Policy for Your Ecommerce Store" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
          <p className="mb-6">
            Cookies are small text files that are placed on your computer or mobile device when you visit
            a website. They are widely used to make websites work more efficiently and provide a better
            user experience, as well as to provide information to website owners.
          </p>

          <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
          <p className="mb-4">We use cookies for several purposes:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>To ensure our website functions properly</li>
            <li>To remember your preferences and settings</li>
            <li>To keep you logged in during your visit</li>
            <li>To analyze how our website is used</li>
            <li>To improve your browsing experience</li>
            <li>To show you relevant advertisements</li>
            <li>To provide social media features</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>

          <h3 className="text-xl font-medium mb-2">Essential Cookies</h3>
          <p className="mb-4">
            These cookies are necessary for the website to function and cannot be switched off in our
            systems. They are usually only set in response to actions made by you which amount to a
            request for services, such as:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Setting your privacy preferences</li>
            <li>Logging in or filling in forms</li>
            <li>Adding items to your shopping cart</li>
            <li>Completing your purchase</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">Performance Cookies</h3>
          <p className="mb-4">
            These cookies allow us to count visits and traffic sources so we can measure and improve
            the performance of our site. They help us to know which pages are the most and least
            popular and see how visitors move around the site.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Google Analytics</li>
            <li>Site usage statistics</li>
            <li>Page load times</li>
            <li>Error tracking</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">Functional Cookies</h3>
          <p className="mb-4">
            These cookies enable the website to provide enhanced functionality and personalization.
            They may be set by us or by third-party providers whose services we have added to our pages.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Language preferences</li>
            <li>Region selection</li>
            <li>Font size preferences</li>
            <li>Theme settings (light/dark mode)</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">Targeting Cookies</h3>
          <p className="mb-4">
            These cookies may be set through our site by our advertising partners. They may be used
            by those companies to build a profile of your interests and show you relevant adverts
            on other sites.
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Facebook Pixel</li>
            <li>Google Ads</li>
            <li>Retargeting campaigns</li>
            <li>Interest-based advertising</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
          <p className="mb-4">
            We also use third-party services that may set cookies on your device. These include:
          </p>

          <div className="mb-6">
            <h4 className="text-lg font-medium mb-2">Analytics Services</h4>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Google Analytics:</strong> Tracks website usage and user behavior</li>
              <li><strong>Hotjar:</strong> Records user sessions for UX improvement</li>
            </ul>

            <h4 className="text-lg font-medium mb-2">Social Media</h4>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Facebook:</strong> Social sharing and advertising</li>
              <li><strong>Twitter:</strong> Social sharing features</li>
              <li><strong>Instagram:</strong> Social media integration</li>
            </ul>

            <h4 className="text-lg font-medium mb-2">Payment Processors</h4>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Stripe:</strong> Secure payment processing</li>
              <li><strong>PayPal:</strong> Alternative payment options</li>
            </ul>

            <h4 className="text-lg font-medium mb-2">Customer Support</h4>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Intercom:</strong> Live chat functionality</li>
              <li><strong>Zendesk:</strong> Support ticket system</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Managing Your Cookie Preferences</h2>
          <p className="mb-4">You have several options for managing cookies:</p>

          <h3 className="text-xl font-medium mb-2">Browser Settings</h3>
          <p className="mb-4">
            Most web browsers allow you to control cookies through their settings preferences.
            You can set your browser to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Block all cookies</li>
            <li>Block third-party cookies</li>
            <li>Delete cookies when you close the browser</li>
            <li>Notify you when cookies are being set</li>
          </ul>

          <h3 className="text-xl font-medium mb-2">Cookie Consent Manager</h3>
          <p className="mb-4">
            When you first visit our site, you'll see a cookie banner allowing you to choose which
            types of cookies to accept. You can update your preferences at any time by clicking the
            "Cookie Settings" link in our footer.
          </p>

          <h3 className="text-xl font-medium mb-2">Opt-Out Links</h3>
          <p className="mb-4">For specific third-party services, you can opt out directly:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 hover:underline">Google Analytics Opt-out</a></li>
            <li>Google Ads: <a href="https://adssettings.google.com" className="text-blue-600 hover:underline">Google Ad Settings</a></li>
            <li>Facebook: <a href="https://www.facebook.com/ads/preferences" className="text-blue-600 hover:underline">Facebook Ad Preferences</a></li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">Cookie Retention</h2>
          <p className="mb-4">Different cookies have different lifespans:</p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
            <li><strong>Persistent Cookies:</strong> Remain on your device for a set period (up to 2 years)</li>
            <li><strong>Authentication Cookies:</strong> Usually expire after 30 days of inactivity</li>
            <li><strong>Preference Cookies:</strong> Typically last for 1 year</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">Impact of Disabling Cookies</h2>
          <p className="mb-4">
            If you choose to disable certain cookies, some features of our website may not function
            properly. This could affect:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Your ability to stay logged in</li>
            <li>Items remaining in your shopping cart</li>
            <li>Personalized content and recommendations</li>
            <li>Website performance optimization</li>
            <li>Access to certain features requiring preferences</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
          <p className="mb-6">
            We may update this Cookie Policy from time to time to reflect changes in our practices
            or for other operational, legal, or regulatory reasons. We will notify you of any material
            changes by posting the updated policy on our website.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-2">If you have any questions about our use of cookies, please contact us:</p>
          <ul className="list-none mb-6">
            <li>Email: cookies@yourstore.com</li>
            <li>Address: [Your Business Address]</li>
            <li>Phone: [Your Phone Number]</li>
          </ul>

          <div className="bg-gray-50 p-4 rounded-lg mt-8">
            <h3 className="text-lg font-medium mb-2">Quick Cookie Settings</h3>
            <p className="text-sm text-gray-600 mb-4">
              You can adjust your cookie preferences here:
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Essential Cookies</span>
                <span className="text-xs text-gray-500">Always Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Performance Cookies</span>
                <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Manage</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Functional Cookies</span>
                <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Manage</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Targeting Cookies</span>
                <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Manage</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiePolicy;