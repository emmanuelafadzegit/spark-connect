import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHelmet from "@/components/SEOHelmet";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEOHelmet 
        title="Privacy Policy"
        description="Read BexMatch's Privacy Policy. Learn how we collect, use, and protect your personal information on our dating platform."
        url="https://bexmatch.com/privacy"
      />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Privacy Policy</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl prose prose-sm dark:prose-invert">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-muted-foreground">Last updated: January 2026</p>

          <h2>1. Information We Collect</h2>
          
          <h3>1.1 Information You Provide</h3>
          <ul>
            <li>Account information (email, name, date of birth)</li>
            <li>Profile information (photos, bio, interests, preferences)</li>
            <li>Communications with other users</li>
            <li>Payment information (processed securely by third parties)</li>
          </ul>

          <h3>1.2 Information Collected Automatically</h3>
          <ul>
            <li>Device information (type, operating system)</li>
            <li>Usage data (features used, interactions)</li>
            <li>Location data (with your permission)</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and improve the App</li>
            <li>Match you with compatible users</li>
            <li>Send notifications about matches and messages</li>
            <li>Process payments for premium features</li>
            <li>Ensure safety and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>We share your information with:</p>
          <ul>
            <li>Other users (profile information you choose to share)</li>
            <li>Service providers (hosting, analytics, payment processing)</li>
            <li>Law enforcement (when required by law)</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>

          <h2>4. Location Data</h2>
          <p>
            We collect location data to show you potential matches nearby. Location access is optional, 
            but some features may not work without it. You can control location permissions in your 
            device settings.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. When you delete your account, 
            we delete your personal information within 30 days, except where required by law.
          </p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and data</li>
            <li>Export your data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2>7. Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your data. 
            However, no system is completely secure, and we cannot guarantee absolute security.
          </p>

          <h2>8. Children's Privacy</h2>
          <p>
            The App is not intended for users under 18. We do not knowingly collect information from 
            children under 18.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant 
            changes through the App or by email.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            For privacy-related questions or to exercise your rights, contact us at privacy@bexmatch.app
          </p>

          <div className="mt-8 text-center text-muted-foreground flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-primary fill-primary" /> by BexMatch
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
