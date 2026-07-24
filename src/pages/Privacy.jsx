import { Helmet } from 'react-helmet-async';

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Eazy1teck</title>
        <meta name="description" content="Privacy policy for Eazy1teck online store" />
      </Helmet>
      <div className="container" style={{ maxWidth: '800px', padding: '2rem 1rem', margin: '0 auto' }}>
        <h1>Privacy Policy</h1>
        <p>
          <strong>Last Updated: July 2026</strong>
        </p>

        <h2>1. Introduction</h2>
        <p>
          Eazy1teck ("we," "us," "our," or "Company") operates the eazy1teck.com website and mobile application. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

          Please read this privacy policy carefully. If you do not agree with our policies and practices, please do not use our Services. By accessing and using Eazy1teck, you acknowledge that you have read, understood, and agree to be bound by all the provisions of this Privacy Policy.
        </p>

        <h2>2. Information We Collect</h2>
        <p>
          <strong>Personal Information You Provide:</strong>
        </p>
        <ul>
          <li>Account Registration: Name, email address, phone number, password, and address</li>
          <li>Orders: Product preferences, delivery address, payment information</li>
          <li>Communications: Messages, feedback, and customer support inquiries</li>
          <li>Profile Information: Profile picture, preferences, and account settings</li>
        </ul>

        <p>
          <strong>Automatically Collected Information:</strong>
        </p>
        <ul>
          <li>Device Information: Browser type, IP address, device identifiers</li>
          <li>Usage Data: Pages visited, time spent, clicks, and search queries</li>
          <li>Cookies: Session and preference cookies to enhance user experience</li>
          <li>Location: General location data from your device (if permitted)</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use collected information for:</p>
        <ul>
          <li>Processing orders and payments</li>
          <li>Delivering products and customer support</li>
          <li>Improving website functionality and user experience</li>
          <li>Sending promotional updates and newsletters (with your consent)</li>
          <li>Fraud detection and security purposes</li>
          <li>Complying with legal obligations</li>
          <li>Analyzing usage patterns to improve our services</li>
        </ul>

        <h2>4. Information Sharing</h2>
        <p>
          We do not sell, trade, or rent your personal information to third parties. We may share information with:
        </p>
        <ul>
          <li>Service Providers: Payment processors, delivery partners, hosting providers</li>
          <li>Legal Requirements: Law enforcement, government agencies when required by law</li>
          <li>Business Transfers: In case of merger, acquisition, or business sale</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>
          We implement industry-standard security measures including:
        </p>
        <ul>
          <li>SSL/TLS encryption for data transmission</li>
          <li>Secure password hashing for stored credentials</li>
          <li>Regular security audits and updates</li>
          <li>Access controls and authentication protocols</li>
        </ul>

        <p>
          While we strive to protect your information, no system is completely secure. We cannot guarantee absolute security of your data.
        </p>

        <h2>6. Cookies and Tracking</h2>
        <p>
          We use cookies to:
        </p>
        <ul>
          <li>Maintain user sessions</li>
          <li>Remember preferences and settings</li>
          <li>Analyze website usage</li>
          <li>Improve user experience</li>
        </ul>

        <p>
          You can control cookie settings in your browser. Disabling cookies may affect site functionality.
        </p>

        <h2>7. Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your data</li>
          <li>Opt-out of marketing communications</li>
          <li>Data portability</li>
        </ul>

        <p>
          To exercise these rights, contact us at the information provided below.
        </p>

        <h2>8. Children's Privacy</h2>
        <p>
          Our Services are not directed to children under 13. We do not knowingly collect information from children under 13. If we become aware of such collection, we will delete the information and terminate the child's account immediately.
        </p>

        <h2>9. Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites. We are not responsible for their privacy practices. We encourage you to review their privacy policies before providing personal information.
        </p>

        <h2>10. Policy Changes</h2>
        <p>
          We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Last Updated" date. Continued use of our Services constitutes acceptance of changes.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          For privacy concerns or to exercise your rights, contact us at:
        </p>
        <ul>
          <li>Email: support@eazy1teck.com</li>
          <li>Phone: +250 783 073 733</li>
          <li>Address: Makuza Peace Plaza, KN 84 Street, Kigali, Rwanda</li>
        </ul>

        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
          This privacy policy is governed by the laws of Rwanda.
        </p>
      </div>
    </>
  );
}
