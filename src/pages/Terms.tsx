import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Terms of Service</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl prose prose-sm dark:prose-invert">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-muted-foreground">Last updated: January 2025</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Matchly ("the App"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the App.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years old to use Matchly. By using the App, you represent and warrant 
            that you are at least 18 years old and have the legal capacity to enter into these Terms.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            To use certain features of the App, you must register for an account. You agree to provide 
            accurate, current, and complete information during registration and to update such information 
            as necessary.
          </p>

          <h2>4. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the App for any unlawful purpose</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Post false, misleading, or offensive content</li>
            <li>Impersonate any person or entity</li>
            <li>Attempt to gain unauthorized access to other accounts</li>
            <li>Use automated systems or bots to access the App</li>
            <li>Solicit money or goods from other users</li>
          </ul>

          <h2>5. Content Guidelines</h2>
          <p>
            You are solely responsible for the content you post. Content must not include:
          </p>
          <ul>
            <li>Explicit or pornographic material</li>
            <li>Hateful or discriminatory content</li>
            <li>Violent or threatening content</li>
            <li>Spam or commercial solicitation</li>
            <li>Content that infringes intellectual property rights</li>
          </ul>

          <h2>6. Subscriptions and Payments</h2>
          <p>
            Premium features require a paid subscription. Subscriptions automatically renew unless cancelled 
            before the renewal date. Refunds are subject to the policies of the respective app stores.
          </p>

          <h2>7. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at any time for violations of these 
            Terms or for any other reason at our sole discretion.
          </p>

          <h2>8. Disclaimers</h2>
          <p>
            The App is provided "as is" without warranties of any kind. We do not guarantee that you will 
            find a match or that interactions will be successful. We are not responsible for the conduct 
            of any user.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Matchly shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages arising from your use of the App.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. Continued use of the App after changes constitutes 
            acceptance of the modified Terms.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            If you have questions about these Terms, please contact us at support@matchly.app
          </p>

          <div className="mt-8 text-center text-muted-foreground flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-primary fill-primary" /> by Matchly
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
