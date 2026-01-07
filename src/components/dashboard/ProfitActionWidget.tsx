
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Package, ArrowRight, Zap } from 'lucide-react';
import { ProfitAction } from '@/hooks/useSmartInventory';

interface ProfitActionWidgetProps {
    actions: ProfitAction[];
    onActionClick: (action: ProfitAction) => void;
}

export function ProfitActionWidget({ actions, onActionClick }: ProfitActionWidgetProps) {
    if (!actions || actions.length === 0) return null;

    return (
        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-white to-orange-50 dark:from-slate-950 dark:to-slate-900">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-400">
                        <Zap className="h-5 w-5 fill-current" />
                        Profit Actions Required
                    </CardTitle>
                    <Badge variant="destructive" className="animate-pulse">
                        {actions.length} Urgent
                    </Badge>
                </div>
                <CardDescription>
                    Acting on these now could recover significant revenue.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {actions.map(action => (
                    <div
                        key={action.id}
                        className="flex items-start justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => onActionClick(action)}
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {action.type === 'discount' && <TrendingDown className="h-4 w-4 text-red-500" />}
                                {action.type === 'bundle' && <Package className="h-4 w-4 text-blue-500" />}
                                <span className="font-semibold text-sm">{action.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-snug max-w-[250px]">
                                {action.description}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                +₹{action.potential_recovery.toFixed(0)}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                Recovery
                            </div>
                            <Button size="icon" variant="ghost" className="h-6 w-6 mt-1 ml-auto">
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
