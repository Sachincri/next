import React from 'react';
import Head from 'next/head';

const TermsOfService: React.FC = () => {
  return (
    <>
      <Head>
        <title>Terms of Service - Your Ecommerce Store</title>
        <meta name="description" content="Terms of Service for Your Ecommerce Store" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-6">
            By accessing and using this website, you accept and agree to be bound by the terms and provision
            of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p className="mb-4">
            Permission is granted to temporarily download one copy of the materials on our website for
            personal, non-commercial transitory viewing only. This is the grant of a license, not a
            transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>modify or copy the materials</li>
            <li>use the materials for any commercial purpose or for any public display</li>
            <li>attempt to reverse engineer any software contained on the website</li>
            <li>remove any copyright or other proprietary notations from the materials</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">3. Account Terms</h2>
          <p className="mb-4">To access certain features of the service, you must create an account. When creating an account:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>You must provide accurate, complete, and current information</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must notify us immediately of any unauthorized use</li>
            <li>We reserve the right to terminate accounts at our discretion</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">4. Products and Services</h2>
          <h3 className="text-xl font-medium mb-2">Product Information</h3>
          <p className="mb-4">
            We strive to provide accurate product descriptions, pricing, and availability information.
            However, we do not warrant that product descriptions or other content is accurate, complete,
            reliable, or error-free.
          </p>

          <h3 className="text-xl font-medium mb-2">Pricing</h3>
          <p className="mb-4">
            All prices are subject to change without notice. We reserve the right to modify or discontinue
            products at any time. Prices do not include applicable taxes, shipping, or handling charges
            unless explicitly stated.
          </p>

          <h3 className="text-xl font-medium mb-2">Availability</h3>
          <p className="mb-6">
            All products are subject to availability. We reserve the right to limit quantities and refuse
            service to anyone at our discretion.
          </p>

          <h2 className="text-2xl font-semibold mb-4">5. Orders and Payment</h2>
          <h3 className="text-xl font-medium mb-2">Order Acceptance</h3>
          <p className="mb-4">
            Your order is an offer to purchase products from us. We reserve the right to accept or decline
            your order for any reason. We may require additional verification before accepting orders.
          </p>

          <h3 className="text-xl font-medium mb-2">Payment Terms</h3>
          <ul className="list-disc pl-6 mb-6">
            <li>Payment is due at the time of purchase</li>
            <li>We accept major credit cards and other payment methods as displayed</li>
            <li>You represent that you have the legal right to use any payment method</li>
            <li>We may charge your payment method upon order placement or shipment</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">6. Shipping and Delivery</h2>
          <p className="mb-4">
            We will ship products to the address you specify in your order. Delivery times are estimates
            and not guaranteed. Risk of loss passes to you upon delivery to the carrier.
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Shipping costs are calculated at checkout</li>
            <li>International orders may be subject to customs fees</li>
            <li>We are not responsible for delays caused by shipping carriers</li>
            <li>Undeliverable packages may be subject to return shipping charges</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">7. Returns and Refunds</h2>
          <p className="mb-4">
            We want you to be satisfied with your purchase. Our return policy includes:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Items may be returned within 30 days of delivery</li>
            <li>Items must be in original condition with tags attached</li>
            <li>Custom or personalized items are not returnable</li>
            <li>Return shipping costs are the customer's responsibility unless the item was defective</li>
            <li>Refunds will be processed to the original payment method</li>
            <li>Processing time for refunds is 5-10 business days</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">8. User Conduct</h2>
          <p className="mb-4">You agree not to use the service to:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Violate any laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit harmful or malicious code</li>
            <li>Spam or harass other users</li>
            <li>Post false or misleading information</li>
            <li>Attempt to gain unauthorized access to our systems</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">9. Intellectual Property</h2>
          <p className="mb-6">
            All content on this website, including but not limited to text, graphics, logos, images,
            and software, is the property of our company or our licensors and is protected by copyright
            and other intellectual property laws.
          </p>

          <h2 className="text-2xl font-semibold mb-4">10. Disclaimers</h2>
          <p className="mb-6">
            The information on this website is provided on an "as is" basis. To the fullest extent
            permitted by law, this Company excludes all representations, warranties, conditions and
            terms whether express, implied, statutory or otherwise.
          </p>

          <h2 className="text-2xl font-semibold mb-4">11. Limitation of Liability</h2>
          <p className="mb-6">
            In no event shall our company or its suppliers be liable for any damages (including,
            without limitation, damages for loss of data or profit, or due to business interruption)
            arising out of the use or inability to use the materials on our website.
          </p>

          <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
          <p className="mb-6">
            These terms and conditions are governed by and construed in accordance with the laws of
            [Your Jurisdiction] and you irrevocably submit to the exclusive jurisdiction of the courts
            in that state or location.
          </p>

          <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
          <p className="mb-6">
            We reserve the right to revise these terms of service at any time without notice.
            By using this website, you are agreeing to be bound by the current version of these terms.
          </p>

          <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
          <p className="mb-2">For questions about these terms, please contact us:</p>
          <ul className="list-none mb-6">
            <li>Email: legal@yourstore.com</li>
            <li>Address: [Your Business Address]</li>
            <li>Phone: [Your Phone Number]</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;