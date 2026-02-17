import { motion } from "framer-motion";
import { UserPlus, Heart, MessageCircle, Sparkles } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up and build a profile that showcases the real you.",
  },
  {
    icon: Heart,
    title: "Discover Matches",
    description: "Swipe through curated profiles and like the ones that resonate.",
  },
  {
    icon: Sparkles,
    title: "It's a Match!",
    description: "When you both like each other, the magic begins.",
  },
  {
    icon: MessageCircle,
    title: "Start Chatting",
    description: "Break the ice and start a conversation that could change your life.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 sm:py-32 bg-background relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 sm:mb-20"
        >
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">How it works</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5">
            Four Simple <span className="text-gradient-primary">Steps</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Finding love has never been easier. Follow these steps to start your journey.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connection line — desktop */}
          <div className="hidden lg:block absolute top-[3.75rem] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.12, duration: 0.5 }}
                className="relative text-center group"
              >
                {/* Icon circle */}
                <div className="relative inline-block mb-6">
                  <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-gradient-primary flex items-center justify-center shadow-primary-md group-hover:shadow-glow transition-shadow duration-500">
                    <step.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-card shadow-xs border border-border flex items-center justify-center">
                    <span className="text-[10px] font-extrabold text-primary">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[220px] mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
