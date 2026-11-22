import { useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInvestmentsStore } from "@/store/useInvestmentsStore";
import { useAuthToken } from "@/hooks/useAuthToken";
import { useBankAccounts } from "@/hooks/usePlaid";
import { TrendingUp, Info } from "lucide-react";
import { mockHoldings, mockInvestmentTransactions } from "@/data/mockData";
import { COLORS } from "@/constants/Colors";

export default function Investments() {
  const { holdings, transactions, totalValue, fetchHoldings, fetchTransactions, isLoading } = useInvestmentsStore();
  const { getToken } = useAuthToken();
  const { data: bankAccounts } = useBankAccounts();
  useEffect(() => {
    const loadInvestmentData = async () => {
      // First try to get item ID from bank accounts
      let itemId = null;
      
      if (bankAccounts?.accounts?.length > 0) {
        itemId = bankAccounts.accounts[0].item_id;
      } else {
        itemId = typeof window !== "undefined" ? localStorage.getItem("plaid_item_id") : null;
      }

      if (!itemId) {
        console.log("No Plaid item ID found for investments");
        return;
      }

      try {
        await Promise.all([
          fetchHoldings(itemId, getToken),
          fetchTransactions(itemId, getToken)
        ]);
      } catch (error) {
        console.error('Investment API not available:', error);
        // If API fails, we'll show the mock data option
      }
    };

    loadInvestmentData();
  }, [bankAccounts, fetchHoldings, fetchTransactions, getToken]);

  const usingSample = holdings.length === 0;
  const displayHoldings = usingSample ? mockHoldings : holdings;
  const displayTransactions = usingSample ? mockInvestmentTransactions : transactions;
  const displayTotalValue = usingSample ? mockHoldings.reduce((sum, h) => sum + h.value, 0) : totalValue;

  const allocationData = useMemo(() => {
    const totals: Record<string, number> = {};
    displayHoldings.forEach((h) => {
      const key = h.ticker || "Other";
      totals[key] = (totals[key] || 0) + (h.value || 0);
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [displayHoldings]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <section>
          <h1 className="text-2xl font-bold mb-4">Portfolio Overview</h1>
          <Card>
            <CardHeader>
              <CardTitle>Total Investment Value</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      {/* Show mock data banner */}
      {usingSample && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <span>Sample portfolio shown. Link an investment account to replace it with live holdings.</span>
          </AlertDescription>
        </Alert>
      )}

      <section>
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Portfolio Overview
          {usingSample && <span className="text-sm font-normal text-muted-foreground">(Sample Data)</span>}
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Total Investment Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">${displayTotalValue.toFixed(2)}</p>
            {allocationData.length > 0 ? (
              <ChartContainer config={{}} className="h-64 mt-4">
                <PieChart>
                  <Pie data={allocationData} dataKey="value" nameKey="name" label>
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Value']} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No investment data available
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Holdings</h2>
        <Card>
          <CardContent>
            {displayHoldings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayHoldings.map((h) => (
                    <TableRow key={h.security_id}>
                      <TableCell className="font-medium">{h.ticker || 'N/A'}</TableCell>
                      <TableCell>{h.name || 'N/A'}</TableCell>
                      <TableCell className="text-right">{h.quantity || 0}</TableCell>
                      <TableCell className="text-right">
                        ${h.price ? h.price.toFixed(2) : '0.00'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${h.value ? h.value.toFixed(2) : '0.00'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No holdings data available
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Transactions</h2>
        <Card>
          <CardContent>
            {displayTransactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Fees</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayTransactions.map((t) => (
                    <TableRow key={t.investment_transaction_id}>
                      <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{t.ticker || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          t.type === 'buy' ? 'bg-green-100 text-green-800' :
                          t.type === 'sell' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {t.type || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{t.quantity || 0}</TableCell>
                      <TableCell className="text-right">
                        ${t.price ? t.price.toFixed(2) : '0.00'}
                      </TableCell>
                      <TableCell className="text-right">
                        ${t.amount ? t.amount.toFixed(2) : '0.00'}
                      </TableCell>
                      <TableCell className="text-right">
                        ${t.fees ? t.fees.toFixed(2) : '0.00'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No transaction data available
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Investment Insights</h2>
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Holdings</p>
                <p className="text-2xl font-bold">{displayHoldings.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{displayTransactions.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold text-green-600">${displayTotalValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}