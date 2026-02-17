import { motion } from "framer-motion";
import { Shield, Eye, Lock, AlertTriangle, UserCheck, MessageSquareWarning, Phone, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SEOHelmet from "@/components/SEOHelmet";

const Safety = () => {
  const safetyTips = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Protect Your Personal Info",
      tips: [
        "Never share your home address, workplace, or financial details",
        "Use the in-app messaging until you feel comfortable",
        "Be cautious about sharing your full name early on",
        "Don't share passwords or sensitive account information",
      ],
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Verify Before You Meet",
      tips: [
        "Video chat before meeting in person",
        "Look for verified profile badges",
        "Search for their social media presence",
        "Trust your instincts if something feels off",
      ],
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Meeting Safely",
      tips: [
        "Always meet in a public place for the first few dates",
        "Tell a friend or family member your plans",
        "Arrange your own transportation",
        "Keep your phone charged and accessible",
      ],
    },
    {
      icon: <MessageSquareWarning className="w-6 h-6" />,
      title: "Report Suspicious Behavior",
      tips: [
        "Report anyone who asks for money or financial help",
        "Flag profiles with stolen or fake photos",
        "Report harassment or inappropriate messages",
        "Alert us about scammers or catfishers",
      ],
    },
  ];

  const features = [
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: "Profile Verification",
      description: "Our photo verification system helps ensure you're talking to real people.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "24/7 Moderation",
      description: "Our team actively monitors for suspicious activity and removes bad actors.",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Data Encryption",
      description: "Your personal information and messages are protected with industry-standard encryption.",
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Block & Report",
      description: "Easily block and report users who make you uncomfortable.",
    },
  ];

  return (
    <>
      <SEOHelmet
        title="Safety Tips - BexMatch"
        description="Learn how to stay safe while dating online. BexMatch provides safety tips and features to protect you."
      />
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
            >
              <Shield className="w-10 h-10 text-primary" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Your Safety is Our <span className="text-primary">Priority</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              We're committed to creating a safe and respectful dating environment.
              Here's how we protect you and how you can stay safe.
            </motion.p>
          </div>
        </section>

        {/* Safety Features */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12"
            >
              How We Keep You Safe
            </motion.h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-card border border-border"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Tips */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-4"
            >
              Safety Tips
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto"
            >
              Follow these guidelines to have a safe and enjoyable dating experience
            </motion.p>
            <div className="grid gap-8 md:grid-cols-2">
              {safetyTips.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {section.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{section.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {section.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Resources */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-destructive/10 border border-destructive/20 text-center"
            >
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
              <p className="text-muted-foreground mb-6">
                If you're in immediate danger, please contact local emergency services.
                If you've experienced harassment or abuse on BexMatch, please report it immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="destructive" asChild>
                  <Link to="/report">Report an Issue</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <Heart className="w-8 h-8" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Ready to Find Your Match?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-primary-foreground/80 mb-8"
            >
              Join our community of verified singles today
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button asChild size="lg" variant="secondary">
                <Link to="/signup">Get Started Free</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Safety;
