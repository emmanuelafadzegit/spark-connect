import { motion } from "framer-motion";
import { ArrowLeft, Mail, Clock, Shield, MessageCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SEOHelmet from "@/components/SEOHelmet";

const supportTopics = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Safety & Security",
    description: "Report harassment, threats, or safety concerns",
    action: "/report",
    actionLabel: "Report Issue",
  },
  {
    icon: <HelpCircle className="w-6 h-6" />,
    title: "Account Help",
    description: "Login issues, password reset, account recovery",
    action: "mailto:Support@Bexmatch.com?subject=Account Help",
    actionLabel: "Email Us",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Billing & Subscriptions",
    description: "Payment issues, refunds, subscription management",
    action: "mailto:Support@Bexmatch.com?subject=Billing Support",
    actionLabel: "Email Us",
  },
  {
    icon: <HelpCircle className="w-6 h-6" />,
    title: "General Feedback",
    description: "Suggestions, feature requests, or general questions",
    action: "mailto:Support@Bexmatch.com?subject=General Feedback",
    actionLabel: "Email Us",
  },
];

const ContactSupport = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHelmet
        title="Contact Support - BexMatch"
        description="Get help from the BexMatch support team. We're here to assist you."
      />
      <Navbar />
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-3xl font-bold mb-2">Contact Support</h1>
              <p className="text-muted-foreground">
                We're here to help. Choose a topic below or reach out directly.
              </p>
            </div>

            {/* Email Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-1">Email Support</h2>
                  <a
                    href="mailto:Support@Bexmatch.com"
                    className="text-primary text-xl font-bold hover:underline"
                  >
                    Support@Bexmatch.com
                  </a>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>We typically respond within 24-48 hours</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Support Topics */}
            <h2 className="text-lg font-semibold mb-4">How can we help?</h2>
            <div className="space-y-3 mb-8">
              {supportTopics.map((topic, i) => (
                <motion.div
                  key={topic.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  {topic.action.startsWith("/") ? (
                    <Link
                      to={topic.action}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        {topic.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground">{topic.description}</p>
                      </div>
                      <span className="text-sm text-primary font-medium">{topic.actionLabel} →</span>
                    </Link>
                  ) : (
                    <a
                      href={topic.action}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        {topic.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground">{topic.description}</p>
                      </div>
                      <span className="text-sm text-primary font-medium">{topic.actionLabel} →</span>
                    </a>
                  )}
                </motion.div>
              ))}
            </div>

            {/* FAQ hint */}
            <div className="text-center p-6 bg-muted/50 rounded-2xl">
              <p className="text-muted-foreground text-sm">
                Before reaching out, check our{" "}
                <Link to="/safety" className="text-primary underline">Safety Tips</Link>{" "}
                and{" "}
                <Link to="/terms" className="text-primary underline">Terms of Service</Link>{" "}
                for quick answers.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactSupport;
