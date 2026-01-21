import { Heart, X, Star, MessageCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SwipeActionsProps {
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  onMessage: () => void;
  isPremiumPlus: boolean;
  disabled?: boolean;
}

const SwipeActions = ({ onSwipe, onMessage, isPremiumPlus, disabled }: SwipeActionsProps) => {
  return (
    <div className="flex items-center justify-center gap-4 py-6 px-4">
      {/* Pass/Dislike */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onSwipe('left')}
        disabled={disabled}
        className="w-14 h-14 rounded-full shadow-lg border-2 border-destructive/40 hover:bg-destructive/10 hover:border-destructive transition-all"
        aria-label="Pass"
      >
        <X className="w-7 h-7 text-destructive" />
      </Button>

      {/* Super Like */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onSwipe('up')}
        disabled={disabled}
        className="w-12 h-12 rounded-full shadow-lg border-2 border-superlike/40 hover:bg-superlike/10 hover:border-superlike transition-all"
        aria-label="Super Like"
      >
        <Star className="w-6 h-6 text-superlike" />
      </Button>

      {/* Like */}
      <Button
        size="icon"
        onClick={() => onSwipe('right')}
        disabled={disabled}
        className="w-16 h-16 rounded-full shadow-lg bg-gradient-primary hover:opacity-90 transition-all"
        aria-label="Like"
      >
        <Heart className="w-8 h-8 text-primary-foreground" />
      </Button>

      {/* Message (Premium Plus) */}
      <Button
        variant="outline"
        size="icon"
        onClick={onMessage}
        disabled={disabled}
        className="w-12 h-12 rounded-full shadow-lg border-2 border-primary/40 hover:bg-primary/10 hover:border-primary transition-all relative"
        aria-label="Message"
      >
        <MessageCircle className="w-6 h-6 text-primary" />
        {!isPremiumPlus && (
          <Crown className="w-4 h-4 text-accent absolute -top-1 -right-1 drop-shadow" />
        )}
      </Button>
    </div>
  );
};

export default SwipeActions;
