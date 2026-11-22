import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  PieChart, 
  Calendar,
  CreditCard,
  PiggyBank,
  AlertCircle
} from "lucide-react";

interface SuggestionChipsProps {
  onSuggestionClick?: (suggestion: string) => void;
}

const suggestions = [
  {
    category: "Spending Analysis",
    icon: PieChart,
    color: "bg-blue-100 text-blue-700",
    questions: [
      "How much did I spend this month?",
      "What are my top spending categories?",
      "Show me my spending trends",
      "Where am I overspending?"
    ]
  },
  {
    category: "Budget & Planning",
    icon: Target,
    color: "bg-green-100 text-green-700",
    questions: [
      "Help me create a budget",
      "How can I save more money?",
      "What's my budget status?",
      "Suggest budget optimizations"
    ]
  },
  {
    category: "Financial Goals",
    icon: PiggyBank,
    color: "bg-purple-100 text-purple-700",
    questions: [
      "How can I reach my savings goal?",
      "What's my net worth?",
      "Help me plan for retirement",
      "How much should I save monthly?"
    ]
  },
  {
    category: "Transactions",
    icon: CreditCard,
    color: "bg-orange-100 text-orange-700",
    questions: [
      "Explain this transaction",
      "Why was this categorized as...",
      "Find my largest expenses",
      "Show recent transactions"
    ]
  },
  {
    category: "Insights",
    icon: TrendingUp,
    color: "bg-indigo-100 text-indigo-700",
    questions: [
      "What are my financial insights?",
      "How am I doing financially?",
      "What should I focus on?",
      "Any financial red flags?"
    ]
  }
];

export function SuggestionChips({ onSuggestionClick }: SuggestionChipsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSuggestionClick = (question: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(question);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Buttons */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.category}
              variant={selectedCategory === category.category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(
                selectedCategory === category.category ? null : category.category
              )}
              className="text-xs"
            >
              <Icon className="w-3 h-3 mr-1" />
              {category.category}
            </Button>
          );
        })}
      </div>

      {/* Questions for Selected Category */}
      {selectedCategory && (
        <Card>
          <CardContent className="p-3">
            <div className="space-y-2">
              {suggestions
                .find(cat => cat.category === selectedCategory)
                ?.questions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2 text-xs"
                    onClick={() => handleSuggestionClick(question)}
                  >
                    {question}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => handleSuggestionClick("Analyze my spending patterns")}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Analyze
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => handleSuggestionClick("Give me budget recommendations")}
          >
            <Target className="w-3 h-3 mr-1" />
            Budget
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => handleSuggestionClick("What are my financial insights?")}
          >
            <DollarSign className="w-3 h-3 mr-1" />
            Insights
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => handleSuggestionClick("Help me save more money")}
          >
            <PiggyBank className="w-3 h-3 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-muted/50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Pro Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Be specific with your questions for better answers</li>
              <li>• Ask about specific time periods or categories</li>
              <li>• Request actionable recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


