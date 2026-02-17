import { motion } from "framer-motion";
import { Heart, MessageCircle, Shield, Sparkles, Star, Zap } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Smart Matching",
    description: "Our AI-powered algorithm learns your preferences to find truly compatible matches.",
    gradient: "from-primary/15 to-accent/10",
    iconColor: "text-primary",
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description: "Connect instantly with your matches through seamless, real-time messaging.",
    gradient: "from-accent/15 to-primary/10",
    iconColor: "text-accent",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "Feel safe with our photo verification and smart moderation systems.",
    gradient: "from-success/15 to-success/5",
    iconColor: "text-success",
  },
  {
    icon: Star,
    title: "Super Likes",
    description: "Stand out from the crowd and let someone know you're really interested.",
    gradient: "from-superlike/15 to-superlike/5",
    iconColor: "text-superlike",
  },
  {
    icon: Zap,
    title: "Profile Boost",
    description: "Get 3x more visibility and matches with premium profile boosting.",
    gradient: "from-match/15 to-match/5",
    iconColor: "text-match",
  },
  {
    icon: Sparkles,
    title: "Premium Features",
    description: "Unlock unlimited swipes, see who likes you, and much more with Premium.",
    gradient: "from-primary/15 to-match/10",
    iconColor: "text-primary",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 sm:mb-20"
        >
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">Features</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5">
            Why Choose <span className="text-gradient-primary">BexMatch</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Experience dating like never before with features designed to help you find genuine connections.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group relative p-7 sm:p-8 rounded-3xl bg-card shadow-card hover:shadow-card-hover transition-all duration-400 border border-border/50 hover:border-border"
            >
              <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
