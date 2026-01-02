import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Brain
} from 'lucide-react';

export default function AIInsightsPanel({ insights = [] }) {
  const defaultInsights = [
    {
      type: 'opportunity',
      title: '23 cases ready for settlement review',
      description: 'AI has identified cases with 85%+ settlement probability that may be ready for negotiation.',
      action: 'Review Cases',
      icon: TrendingUp,
      color: 'emerald'
    },
    {
      type: 'alert',
      title: '5 potential fraud patterns detected',
      description: 'Network analysis found suspicious referral patterns across recent intakes.',
      action: 'Investigate',
      icon: AlertTriangle,
      color: 'amber'
    },
    {
      type: 'recommendation',
      title: 'Medical record requests pending',
      description: '47 cases have medical records requests older than 30 days. Consider follow-up.',
      action: 'View List',
      icon: Lightbulb,
      color: 'blue'
    }
  ];

  const displayInsights = insights.length > 0 ? insights : defaultInsights;

  const getColorClasses = (color) => {
    const colors = {
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      amber: 'bg-amber-50 text-amber-600 border-amber-200',
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      red: 'bg-red-50 text-red-600 border-red-200',
    };
    return colors[color] || colors.blue;
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">AI Intelligence Brief</CardTitle>
              <p className="text-sm text-slate-400">Real-time insights from APEX AI</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayInsights.map((insight, index) => (
          <div 
            key={index}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                insight.color === 'emerald' ? 'bg-emerald-500/20' :
                insight.color === 'amber' ? 'bg-amber-500/20' :
                insight.color === 'red' ? 'bg-red-500/20' : 'bg-blue-500/20'
              }`}>
                <insight.icon className={`w-4 h-4 ${
                  insight.color === 'emerald' ? 'text-emerald-400' :
                  insight.color === 'amber' ? 'text-amber-400' :
                  insight.color === 'red' ? 'text-red-400' : 'text-blue-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white mb-1">{insight.title}</h4>
                <p className="text-xs text-slate-400 mb-3">{insight.description}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-3 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                >
                  {insight.action}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}