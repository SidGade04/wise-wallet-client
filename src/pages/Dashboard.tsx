import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlaidLink } from "@/components/PlaidLink";
import { BankConnectionStatus } from "@/components/BankConnectionStatus";
import { useAuth } from "@/store/useAuth";
import { useBankAccounts, useTransformedTransactions } from "@/hooks/usePlaid";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  PlusCircle,
  Activity,
  Building2,
  Shield
} from "lucide-react";

export default function Dashboard() {
  const { profile } = useAuth();
  const { data: bankAccounts, isLoading: accountsLoading, error: accountsError } = useBankAccounts();
  const { 
    transactions, 
    isLoading: transactionsLoading, 
    error: transactionsError 
  } = useTransformedTransactions(90);

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Calculate spending metrics
  const { 
    thisMonthTransactions,
    totalSpentThisMonth,
    spendingByCategory,
    recentTransactions
  } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        thisMonthTransactions: [],
        totalSpentThisMonth: 0,
        spendingByCategory: [],
        recentTransactions: []
      };
    }

    const sameMonth = (d: Date | string, ref: Date) => {
      const x = new Date(d);
      return x.getFullYear() === ref.getFullYear() && x.getMonth() === ref.getMonth();
    };

    const thisMonth = transactions.filter(t => sameMonth(t.date, currentMonth));

    const isOutflow = (t: any) =>
      t.amount < 0 || t.transaction_type === 'debit' || t.isExpense === true;

    const spent = thisMonth
      .filter(isOutflow)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const categoryTotals = thisMonth
      .filter(isOutflow)
      .reduce((acc, t) => {
        const categoryName = t.category || 'Other';
        acc[categoryName] ??= { category: categoryName, amount: 0, color: '#8884d8' };
        acc[categoryName].amount += Math.abs(t.amount);
        return acc;
      }, {} as Record<string, any>);

    const categoryData = Object.values(categoryTotals)
      .sort((a: any, b: any) => b.amount - a.amount);

    const recent = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      thisMonthTransactions: thisMonth,
      totalSpentThisMonth: spent,
      spendingByCategory: categoryData,
      recentTransactions: recent
    };
  }, [transactions, monthStart, monthEnd]);

  // Show loading state
  if (transactionsLoading || accountsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-card">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (transactionsError || accountsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || 'User'}!</h1>
          <p className="text-muted-foreground">
            Unable to load financial data at this time
          </p>
        </div>

        <Card className="shadow-card border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            <CardDescription>
              {transactionsError ? `Transactions: ${transactionsError.message}` : ''}
              {accountsError ? `Accounts: ${accountsError.message}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const connectedAccountsCount = bankAccounts?.accounts?.length || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || 'User'}!</h1>
          <p className="text-muted-foreground">
            Here's your financial overview for {format(currentMonth, 'MMMM yyyy')}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Showing data from {transactions?.length || 0} transactions across {connectedAccountsCount} connected accounts
          </p>
        </div>
        
        {connectedAccountsCount === 0 && (
          <PlaidLink>
            <Button variant="financial">
              <PlusCircle className="w-4 h-4 mr-2" />
              Link Bank Account
            </Button>
          </PlaidLink>
        )}
      </div>

      {/* No accounts connected state */}
      {connectedAccountsCount === 0 && (
        <Card className="shadow-card border-dashed dark:bg-gray-800 dark:border-gray-600">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-muted dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-muted-foreground dark:text-gray-400" />
            </div>
            <h3 className="font-medium mb-2 dark:text-white">No Bank Accounts Connected</h3>
            <p className="text-muted-foreground dark:text-gray-300 mb-6 max-w-md mx-auto">
              Connect your bank account to see your financial overview and start tracking your spending.
            </p>
            
            {/* Security Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Bank-level Security</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your data is encrypted and we never store your banking credentials
              </p>
            </div>
            
            <PlaidLink>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <PlusCircle className="w-4 h-4 mr-2" />
                Connect Your First Bank Account
              </Button>
            </PlaidLink>
          </CardContent>
        </Card>
      )}

      {/* Show data even if no accounts connected (for debugging) */}
      {transactions && transactions.length > 0 && (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent This Month</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-expense">
                  ${totalSpentThisMonth.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {thisMonthTransactions.filter(t => t.amount < 0).length} transactions
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactions.length}</div>
                <p className="text-xs text-muted-foreground">
                  Last 90 days
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {spendingByCategory[0]?.category || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  ${spendingByCategory[0]?.amount?.toFixed(2) || '0.00'} spent
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{connectedAccountsCount}</div>
                <p className="text-xs text-muted-foreground">
                  {connectedAccountsCount === 0 ? 'Connect accounts to sync' : 'Active connections'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bank Connection Status */}
          <BankConnectionStatus />

          {/* Charts Section - Only show if we have spending data */}
          {spendingByCategory.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>
                    Your spending breakdown for {format(currentMonth, 'MMMM')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={spendingByCategory.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="category" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {recentTransactions.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700"
                      >
                        <div>
                          <p className="font-medium dark:text-white">{transaction.merchant}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(transaction.date, 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}