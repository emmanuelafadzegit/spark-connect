import { motion } from "framer-motion";
import { Heart, Users, Shield, Sparkles, Target, Globe } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SEOHelmet from "@/components/SEOHelmet";

const About = () => {
  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Authentic Connections",
      description: "We believe in fostering genuine relationships built on shared interests and values.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Safety First",
      description: "Your security is our priority. We employ advanced verification and moderation systems.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Inclusive Community",
      description: "Everyone deserves love. We welcome people from all backgrounds and walks of life.",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Quality Over Quantity",
      description: "Our matching algorithm focuses on compatibility, not just swipe volume.",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Intentional Dating",
      description: "We help you find people who share your relationship goals and intentions.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Reach",
      description: "Connect with singles worldwide while maintaining local dating options.",
    },
  ];

  return (
    <>
      <SEOHelmet
        title="About Us - BexMatch"
        description="Learn about BexMatch's mission to help people find meaningful connections through authentic dating experiences."
      />
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              About <span className="text-primary">BexMatch</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground leading-relaxed"
            >
              We're on a mission to help people find meaningful connections that last.
              BexMatch combines cutting-edge technology with a human touch to create
              an authentic dating experience.
            </motion.p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="prose prose-lg mx-auto text-center"
            >
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                BexMatch was founded with a simple belief: everyone deserves to find
                their perfect match. We noticed that many dating apps focused on
                superficial connections, leaving users feeling disconnected and
                frustrated.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We built BexMatch to be different. Our platform emphasizes genuine
                compatibility through detailed profiles, thoughtful prompts, and
                intelligent matching algorithms that go beyond just photos.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, thousands of people use BexMatch to find meaningful
                relationships, friendships, and connections that enrich their lives.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12"
            >
              Our Values
            </motion.h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3 text-center">
              {[
                { number: "50K+", label: "Active Users" },
                { number: "10K+", label: "Matches Made" },
                { number: "95%", label: "Satisfaction Rate" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-primary-foreground/80">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default About;
