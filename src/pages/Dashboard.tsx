import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransformedTransactions, useBankAccounts } from "@/hooks/usePlaid";
import { useAuth } from "@/store/useAuth";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Building2,
  PiggyBank,
  Target,
  Zap,
  Bot,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { PlaidLink } from "@/components/PlaidLink";
import { useIsMobile } from "@/hooks/useMobile";
import { StaggerContainer, StaggerItem } from "@/components/ui/page-transition";
import { Loading, SkeletonLoading } from "@/components/ui/loading";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { profile, user, loading, profileLoading } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  
  // Fetch data from your API endpoints
  const { 
    transactions, 
    isLoading: transactionsLoading, 
    error: transactionsError,
    refetch
  } = useTransformedTransactions(Number(selectedPeriod));

  // Debug logging
  console.log('Dashboard Debug:', {
    profile,
    userId: user?.id,
    profileHasBank: profile?.has_connected_bank,
    loading,
    profileLoading,
    transactionsCount: transactions?.length || 0,
    selectedPeriod
  });
  
  const { data: bankAccounts, isLoading: accountsLoading } = useBankAccounts();

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Calculate real metrics from API data
  const { 
    thisMonthTransactions,
    totalSpentThisMonth,
    spendingByCategory,
    recentTransactions,
    totalIncome,
    totalExpenses,
    netSavings,
    incomeChange,
    expenseChange,
    savingsChange,
    budgetStatus,
    spendingTrendsData,
    topCategories,
    asOf,
  } = useMemo(() => {
    console.log('Dashboard useMemo Debug:', {
      transactionsCount: transactions?.length || 0,
      selectedPeriod,
      hasTransactions: !!transactions && transactions.length > 0
    });

    if (!transactions || transactions.length === 0) {
      console.log('No transactions available, returning defaults');
      return {
        thisMonthTransactions: [],
        totalSpentThisMonth: 0,
        spendingByCategory: [],
        recentTransactions: [],
        totalIncome: 0,
        totalExpenses: 0,
        netSavings: 0,
        incomeChange: 0,
        expenseChange: 0,
        savingsChange: 0,
        budgetStatus: 0,
        spendingTrendsData: [],
        topCategories: [],
        asOf: new Date(),
      };
    }

    // Use the selected period instead of just current month
    const latestMs = Math.max(...transactions.map((t) => new Date(t.date).getTime()));
    const periodMs = Number(selectedPeriod) * 24 * 60 * 60 * 1000;
    const now = latestMs < Date.now() - periodMs ? new Date(latestMs) : new Date();
    const periodStart = new Date(now.getTime() - periodMs);
    
    // Filter transactions within the selected period
    const periodTransactions = transactions.filter((t, index) => {
      const tDate = new Date(t.date);
      const isInPeriod = tDate >= periodStart && tDate <= now;
      
      // Debug first few transactions
      if (index < 3) {
        console.log('Date Filter Debug:', {
          transaction: t,
          tDate: tDate.toISOString(),
          periodStart: periodStart.toISOString(),
          periodEnd: now.toISOString(),
          isInPeriod
        });
      }
      
      return isInPeriod;
    });

    console.log('Period Transactions Debug:', {
      totalTransactions: transactions.length,
      periodTransactions: periodTransactions.length,
      periodStart: periodStart.toISOString(),
      periodEnd: now.toISOString(),
      sampleTransaction: periodTransactions[0] || 'None'
    });

    // For backward compatibility, also keep current month filter
    const sameMonth = (d: Date | string, ref: Date) => {
      const x = new Date(d);
      return x.getFullYear() === ref.getFullYear() && x.getMonth() === ref.getMonth();
    };

    const thisMonth = transactions.filter(t => sameMonth(t.date, currentMonth));

    const isOutflow = (t: any) =>
      t.amount < 0 || t.transaction_type === 'debit' || t.isExpense === true;

    const isInflow = (t: any) =>
      t.amount > 0 || t.transaction_type === 'credit' || t.isExpense === false;

    // Use period transactions for calculations (more accurate for recent data)
    const spent = periodTransactions
      .filter(isOutflow)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const income = periodTransactions
      .filter(isInflow)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const expenses = periodTransactions
      .filter(isOutflow)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netSavings = income - expenses;

    console.log('Financial Calculations Debug:', {
      income,
      expenses,
      netSavings,
      periodTransactionsCount: periodTransactions.length,
      outflowCount: periodTransactions.filter(isOutflow).length,
      inflowCount: periodTransactions.filter(isInflow).length
    });

    const categoryTotals = periodTransactions
      .filter(isOutflow)
      .reduce((acc, t) => {
        const categoryName = t.category || 'Other';
        acc[categoryName] ??= { category: categoryName, amount: 0, color: '#8884d8' };
        acc[categoryName].amount += Math.abs(t.amount);
        return acc;
      }, {} as Record<string, any>);

    const categoryData = (Object.values(categoryTotals) as Array<{category: string, amount: number, color: string}>)
      .sort((a, b) => b.amount - a.amount);

    const recent = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    // Calculate real percentage changes from previous period
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const previousMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
    
    const previousMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= previousMonth && tDate <= previousMonthEnd;
    });

    const previousIncome = previousMonthTransactions
      .filter(isInflow)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const previousExpenses = previousMonthTransactions
      .filter(isOutflow)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const previousNetSavings = previousIncome - previousExpenses;

    // Calculate percentage changes
    const incomeChange = previousIncome > 0 ? ((income - previousIncome) / previousIncome) * 100 : 0;
    const expenseChange = previousExpenses > 0 ? ((expenses - previousExpenses) / previousExpenses) * 100 : 0;
    const savingsChange = previousNetSavings !== 0 ? ((netSavings - previousNetSavings) / Math.abs(previousNetSavings)) * 100 : 0;

    // Calculate budget status based on actual spending vs typical monthly spending
    const avgMonthlySpending = transactions
      .filter(isOutflow)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) / Math.max(1, Math.ceil((new Date().getTime() - new Date(transactions[0]?.date || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30)));
    
    const budgetStatus = avgMonthlySpending > 0 ? Math.min(100, (expenses / avgMonthlySpending) * 100) : 0;

    // Prepare chart data
    // 1. Spending Trends Chart - Daily spending over the selected period
    const spendingTrendsData = [];
    for (let i = Number(selectedPeriod) - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayTransactions = periodTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.toDateString() === date.toDateString();
      });
      
      const daySpending = dayTransactions
        .filter(isOutflow)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      spendingTrendsData.push({
        date: format(date, 'MMM dd'),
        spending: daySpending,
        fullDate: date
      });
    }

    // 2. Category Breakdown Chart - Top spending categories
    const topCategories = categoryData.slice(0, 8).map((cat, index) => ({
      ...cat,
      color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ff8042', '#00c49f'][index % 8]
    }));

    return {
      thisMonthTransactions: thisMonth,
      totalSpentThisMonth: spent,
      spendingByCategory: categoryData,
      recentTransactions: recent,
      totalIncome: income,
      totalExpenses: expenses,
      netSavings,
      incomeChange,
      expenseChange,
      savingsChange,
      budgetStatus,
        spendingTrendsData,
        topCategories,
        asOf: now,
      };
  }, [transactions, monthStart, monthEnd, selectedPeriod]);

  // Loading state
  if (transactionsLoading || accountsLoading) {
    return (
      <StaggerContainer className="space-y-6">
        <StaggerItem>
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="shadow-card">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            <Card className="shadow-card">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </StaggerItem>
      </StaggerContainer>
    );
  }

  // Error state
  if (transactionsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Dashboard</h1>
          <p className="text-muted-foreground">
            Unable to load dashboard data
          </p>
        </div>

        <Card className="shadow-card border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            <CardDescription>
              {transactionsError instanceof Error ? transactionsError.message : 'An error occurred while loading dashboard data'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No bank accounts connected
  if (!bankAccounts?.accounts?.length) {
    return (
      <StaggerContainer className="space-y-6">
        <StaggerItem>
          <div>
            <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || 'User'}! Connect your bank account to get started.
            </p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <Card className="shadow-card border-dashed">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No Bank Accounts Connected</h3>
              <p className="text-muted-foreground mb-4">
                Connect your bank account to view your financial overview and start tracking your spending.
              </p>
              <PlaidLink>
                <Button variant="financial" className={isMobile ? 'w-full' : ''}>
                  <Building2 className="w-4 h-4 mr-2" />
                  Connect Bank Account
                </Button>
              </PlaidLink>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    );
  }

  return (
    <StaggerContainer className="space-y-6">
      {/* Header */}
      <StaggerItem>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || 'User'}! Here's your financial overview.
              {asOf && Date.now() - asOf.getTime() > 1000 * 60 * 60 * 24
                ? ` Latest bank activity is through ${format(asOf, "MMM d, yyyy")}.`
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 text-sm border rounded-md bg-background"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
      </StaggerItem>

      {/* Overview Cards */}
      <StaggerItem>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                ${totalIncome.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {incomeChange > 0 ? '+' : ''}{incomeChange.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-expense" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">
                ${totalExpenses.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {expenseChange > 0 ? '+' : ''}{expenseChange.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-primary" />
                Net Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netSavings >= 0 ? 'text-success' : 'text-expense'}`}>
                {netSavings >= 0 ? '+' : ''}${netSavings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {savingsChange > 0 ? '+' : ''}{savingsChange.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-warning" />
                Budget Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {budgetStatus.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                of monthly budget used
              </p>
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* AI Assistant CTA */}
      <StaggerItem>
        <Card className="shadow-card bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-financial rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">AI Financial Assistant</h3>
                  <p className="text-muted-foreground">
                    Get personalized insights and recommendations for your finances
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/assistant')} 
                variant="financial"
                className={isMobile ? 'w-full mt-4' : ''}
              >
                <Bot className="w-4 h-4 mr-2" />
                Ask AI Assistant
              </Button>
            </div>
          </CardContent>
        </Card>
      </StaggerItem>

      {/* Charts Section */}
      <StaggerItem>
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>
                Your spending patterns over the last {selectedPeriod} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {spendingTrendsData && spendingTrendsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={spendingTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.25} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const value = payload[0].value;
                          const numericValue = typeof value === 'number' ? value : 0;
                          return (
                            <div className="bg-popover text-popover-foreground p-3 border border-border rounded-lg shadow-lg">
                              <p className="font-medium">{label}</p>
                              <p className="text-sky-400 font-semibold">
                                ${numericValue.toFixed(2)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="spending" 
                      stroke="#38bdf8" 
                      strokeWidth={3}
                      dot={{ fill: "#38bdf8", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#38bdf8", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No spending data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>
                Where your money is going
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topCategories && topCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topCategories} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.25} />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const value = payload[0].value;
                          const numericValue = typeof value === 'number' ? value : 0;
                          return (
                            <div className="bg-popover text-popover-foreground p-3 border border-border rounded-lg shadow-lg">
                              <p className="font-medium">{label}</p>
                              <p className="text-sky-400 font-semibold">
                                ${numericValue.toFixed(2)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {topCategories.map((cat) => (
                        <Cell key={cat.category} fill={cat.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No category data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* Recent Transactions */}
      <StaggerItem>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest financial activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {(transaction.merchant || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{transaction.merchant}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(transaction.date, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.amount < 0 ? 'text-expense' : 'text-success'
                      }`}>
                        {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.category || 'Other'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </StaggerItem>

    </StaggerContainer>
  );
}