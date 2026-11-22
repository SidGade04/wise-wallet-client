import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BankConnectionStatus } from "@/components/BankConnectionStatus";
import { useAuth } from "@/store/useAuth";
import { useBankAccounts } from "@/hooks/usePlaid";
import { 
  Building2, 
  PlusCircle, 
  CreditCard,
  Shield,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { StaggerContainer, StaggerItem } from "@/components/ui/page-transition";

export default function Banks() {
  const { profile } = useAuth();
  const { data: bankAccounts, isLoading: accountsLoading } = useBankAccounts();
  const { toast } = useToast();
  const [showAddBank, setShowAddBank] = useState(false);

  const connectedAccountsCount = bankAccounts?.accounts?.length || 0;
  const hasConnectedBanks = connectedAccountsCount > 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <StaggerContainer>
        {/* Header Section */}
        <StaggerItem>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Bank Accounts</h1>
            <p className="text-muted-foreground">
              Manage your connected financial institutions and monitor account health
            </p>
          </div>
        </StaggerItem>

        {/* Quick Stats */}
        <StaggerItem>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Connected Banks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {connectedAccountsCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Financial institutions
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-success" />
                  Total Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {bankAccounts?.accounts?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Individual accounts
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-warning" />
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {hasConnectedBanks ? 'Active' : 'None'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {hasConnectedBanks ? 'All accounts healthy' : 'No banks connected'}
                </p>
              </CardContent>
            </Card>
          </div>
        </StaggerItem>

        {/* Main Content */}
        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bank Management Section */}
            <div className="lg:col-span-2">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Connected Banks</span>
                    <Button 
                      onClick={() => setShowAddBank(!showAddBank)}
                      size="sm"
                      variant="outline"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      {showAddBank ? 'Cancel' : 'Add Bank'}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Manage your connected financial institutions and monitor their health
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showAddBank && (
                    <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Connect New Bank Account</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Securely connect your bank account using Plaid's bank-level security
                      </p>
                      <BankConnectionStatus />
                    </div>
                  )}
                  
                  <BankConnectionStatus />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Help & Tips */}
            <div className="space-y-6">
              {/* Security Info */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Security & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>• Your banking credentials are never stored</p>
                    <p>• All data is encrypted in transit and at rest</p>
                    <p>• Bank-level security standards (256-bit encryption)</p>
                    <p>• Read-only access to your financial data</p>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>• Connect multiple banks for comprehensive tracking</p>
                    <p>• Sync regularly to keep data up-to-date</p>
                    <p>• Monitor connection health for optimal performance</p>
                    <p>• Disconnect unused accounts to maintain security</p>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Having trouble connecting your bank account?
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
