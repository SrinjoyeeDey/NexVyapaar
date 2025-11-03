import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
}

export const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient = "from-primary to-secondary" 
}: FeatureCardProps) => {
  return (
    <Card className="stat-card group cursor-pointer">
      <CardContent className="p-6">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-display font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};
