import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Gem, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PricingTeaserProps {
  onSubscribeClick?: (tier: string) => void;
}

const plans = [
  {
    name: "Pro",
    tier: "pro",
    price: "14.99",
    icon: Zap,
    headline: "Clarity for every message.",
    subline: "100 credits • Smart Snapshot included",
    cta: "Start Pro",
    bestFor: "Best for: daily dating & consistent texting.",
    features: [
      "See interest level at a glance",
      "Intent + tone detection",
      "Best time to reply",
      "Full chat history",
    ],
    popular: false,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Plus",
    tier: "plus",
    price: "29.99",
    icon: Crown,
    headline: "Deeper context, better replies.",
    subline: "180 credits • Expanded included",
    cta: "Start Plus",
    bestFor: "Best for: mixed signals & important conversations.",
    features: [
      "Expanded analysis by default",
      "Smarter explanations",
      "Images supported",
      "Deep available anytime",
    ],
    popular: true,
    color: "from-accent to-rose-500",
  },
  {
    name: "Max",
    tier: "max",
    price: "49.99",
    icon: Gem,
    headline: "Maximum confidence.",
    subline: "300 credits • Deep included",
    cta: "Start Max",
    bestFor: "Best for: power users & serious dating.",
    features: [
      "Deep analysis included",
      "Full intent + context breakdown",
      "Conversation flow + next steps",
      "Priority support",
    ],
    popular: false,
    color: "from-violet-500 to-purple-600",
  },
];

export const PricingTeaser = ({ onSubscribeClick }: PricingTeaserProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubscribe = (tier: string) => {
    if (onSubscribeClick) {
      onSubscribeClick(tier);
    } else if (user) {
      navigate("/pricing");
    } else {
      navigate("/");
    }
  };

  return (
    <section className="section-padding bg-gradient-subtle relative overflow-hidden" id="pricing">
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />
      
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-accent/10 text-accent px-5 py-2 rounded-full text-sm font-semibold mb-6"
          >
            <Sparkles className="h-4 w-4" />
            Pricing
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-6">
            Choose your plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start today with better conversations. Every plan comes with a money-back guarantee.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className={`relative rounded-3xl p-8 transition-all duration-500 ${
                plan.popular
                  ? 'bg-gradient-hero text-white shadow-2xl scale-105 border border-white/10'
                  : 'bg-card border border-border/50 shadow-card hover:shadow-card-hover'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-rose-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                  Most popular
                </span>
              )}

              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 shadow-lg`}>
                <plan.icon className="h-7 w-7 text-white" />
              </div>

              <h3 className="text-2xl font-bold font-display mb-1">{plan.name}</h3>
              <p className={`text-sm mb-4 ${plan.popular ? 'text-amber-400' : 'text-accent'}`}>
                {plan.headline}
              </p>

              <div className="mb-4">
                <span className="text-5xl font-bold font-display">€{plan.price}</span>
                <span className={`text-sm ${plan.popular ? 'text-white/70' : 'text-muted-foreground'}`}>/month</span>
              </div>

              <p className={`text-sm mb-6 ${plan.popular ? 'text-white/60' : 'text-muted-foreground'}`}>
                {plan.subline}
              </p>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      plan.popular ? 'text-amber-400' : 'text-success'
                    }`} />
                    <span className={plan.popular ? 'text-white/90' : ''}>{feature}</span>
                  </li>
                ))}
              </ul>

              <p className={`text-xs mb-6 ${plan.popular ? 'text-white/50' : 'text-muted-foreground/60'}`}>
                {plan.bestFor}
              </p>

              <Button
                variant={plan.popular ? "hero" : "outline"}
                className="w-full"
                size="lg"
                onClick={() => handleSubscribe(plan.tier)}
              >
                {plan.popular && <Zap className="h-4 w-4 mr-2" />}
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
