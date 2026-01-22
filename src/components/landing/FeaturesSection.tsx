import { motion } from "framer-motion";
import { Heart, MessageCircle, Shield, Sparkles, Star, Zap } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Smart Matching",
    description: "Our AI-powered algorithm learns your preferences to find compatible matches.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description: "Connect instantly with matches through our seamless messaging system.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "Feel safe with our photo verification and moderation systems.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Star,
    title: "Super Likes",
    description: "Stand out from the crowd and let someone know you're really interested.",
    color: "text-superlike",
    bgColor: "bg-superlike/10",
  },
  {
    icon: Zap,
    title: "Profile Boost",
    description: "Get more visibility and matches with premium profile boosting.",
    color: "text-match",
    bgColor: "bg-match/10",
  },
  {
    icon: Sparkles,
    title: "Premium Features",
    description: "Unlock unlimited swipes, see who likes you, and more with Premium.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="text-gradient-primary">BexMatch</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience dating like never before with features designed to help you find genuine connections.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="group p-8 rounded-3xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
