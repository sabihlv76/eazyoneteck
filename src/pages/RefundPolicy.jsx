import { Helmet } from 'react-helmet-async';

export default function RefundPolicy() {
  return (
    <>
      <Helmet>
        <title>Refund Policy - Eazy1teck</title>
        <meta name="description" content="Refund and return policy for Eazy1teck products" />
        <link rel="canonical" href="https://eazy1teck.com/refund-policy" />
      </Helmet>
      <div className="container" style={{ maxWidth: '800px', padding: '2rem 1rem', margin: '0 auto' }}>
        <h1>Refund & Return Policy</h1>
        <p>
          <strong>Last Updated: July 2026</strong>
        </p>

        <h2>1. Return Eligibility</h2>
        <p>
          We want you to be completely satisfied with your purchase. If you are not satisfied with a product, you may return it within 14 days of receipt under the following conditions:
        </p>
        <ul>
          <li>Product is unused, unmodified, and in original packaging</li>
          <li>All accessories, chargers, cables, and documentation are included</li>
          <li>Product is in resalable condition</li>
          <li>Original receipt or proof of purchase is provided</li>
          <li>Return request is initiated within 14 days of delivery</li>
        </ul>

        <h2>2. Non-Returnable Items</h2>
        <p>
          The following items cannot be returned or refunded:
        </p>
        <ul>
          <li>Items purchased on clearance or marked "Final Sale"</li>
          <li>Used, damaged, or opened products</li>
          <li>Products with missing accessories or documentation</li>
          <li>Items without a valid proof of purchase</li>
          <li>Products opened or used beyond testing</li>
          <li>Custom or personalized items</li>
        </ul>

        <h2>3. Return Process</h2>
        <p>
          To initiate a return:
        </p>
        <ol>
          <li>Contact us at support@eazy1teck.com or call +250 783 073 733</li>
          <li>Provide your order number and reason for return</li>
          <li>Follow instructions for shipping the product back to us</li>
          <li>Ensure product is securely packaged and insured</li>
          <li>Ship to the address provided by our support team</li>
        </ol>

        <p>
          <strong>Note:</strong> Shipping costs for returns must be borne by the customer unless the return is due to our error or a defective product.
        </p>

        <h2>4. Refund Processing</h2>
        <p>
          Once we receive and inspect your returned product:
        </p>
        <ul>
          <li>We will verify the condition and authenticity of the product</li>
          <li>If approved, we will process your refund within 5-7 business days</li>
          <li>Refunds will be issued to your original payment method</li>
          <li>Bank transfers may take an additional 3-5 business days to appear</li>
        </ul>

        <p>
          If a return is rejected, we will notify you with reasons and return the product at no additional cost.
        </p>

        <h2>5. Defective Products</h2>
        <p>
          If you receive a defective or damaged product:
        </p>
        <ul>
          <li>Report the issue within 48 hours of delivery</li>
          <li>Provide photos/videos documenting the defect</li>
          <li>You are eligible for a full refund or replacement</li>
          <li>Return shipping costs will be covered by Eazy1teck</li>
          <li>Replacements will be shipped immediately upon return confirmation</li>
        </ul>

        <h2>6. Replacement Policy</h2>
        <p>
          You may request a replacement instead of a refund:
        </p>
        <ul>
          <li>Replacements are processed within 3-5 business days</li>
          <li>We will ship the replacement product to you</li>
          <li>You can return the original item using our prepaid shipping label</li>
          <li>No additional costs apply for replacements due to defects</li>
        </ul>

        <h2>7. Refund Exceptions</h2>
        <p>
          Please note the following:
        </p>
        <ul>
          <li>Custom or special order items have a 7-day return window</li>
          <li>Promotional or discounted items may have a 7-day return window</li>
          <li>Items from liquidation sales are final sale only</li>
          <li>Screen protectors and applied accessories cannot be returned</li>
        </ul>

        <h2>8. Shipping Damages</h2>
        <p>
          If your product arrives damaged during shipping:
        </p>
        <ul>
          <li>Do not accept the delivery or open the package</li>
          <li>Contact us immediately with photos of the damage</li>
          <li>Return the unopened package to the carrier</li>
          <li>File a claim with the delivery service</li>
          <li>We will investigate and offer a refund or replacement</li>
        </ul>

        <h2>9. Warranty vs. Returns</h2>
        <p>
          Our return policy is separate from manufacturer warranties:
        </p>
        <ul>
          <li>Returns are available for 14 days from purchase</li>
          <li>Manufacturer warranties cover defects and malfunctions</li>
          <li>Extended warranty options may be available at checkout</li>
          <li>Service and repairs under warranty are handled by manufacturers</li>
        </ul>

        <h2>10. Contact Information</h2>
        <p>
          For return inquiries or support:
        </p>
        <ul>
          <li>Email: support@eazy1teck.com</li>
          <li>Phone: +250 783 073 733</li>
          <li>Address: Makuza Peace Plaza, KN 84 Street, Kigali, Rwanda</li>
        </ul>

        <p>
          Our customer support team is available Monday-Sunday from 9 AM to 6 PM (Rwanda Time).
        </p>

        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
          This refund policy complies with Rwandan consumer protection laws and regulations.
        </p>
      </div>
    </>
  );
}
