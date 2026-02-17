import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import BexMatchLogo from "@/components/BexMatchLogo";

const footerLinks = {
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Pricing", to: "/pricing" },
    { label: "Safety", to: "/safety" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
  ],
};

const Footer = () => {
  return (
    <footer className="py-12 sm:py-16 bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <BexMatchLogo size="sm" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Find meaningful connections with people who share your passions and values.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-foreground/70 hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BexMatch. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            Made with <Heart className="w-3 h-3 text-primary fill-primary" /> for finding love
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
