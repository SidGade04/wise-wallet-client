import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/store/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Loader2, Check, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmCheckout, useCreateCheckoutSession } from '@/hooks/useSubscription';

const UpgradePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const createCheckoutSession = useCreateCheckoutSession();
  const confirmCheckout = useConfirmCheckout();

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (success === 'true' && sessionId && user) {
      let cancelled = false;
      (async () => {
        try {
          await confirmCheckout.mutateAsync({ sessionId });
        } catch (e) {
          console.error('Confirm checkout failed:', e);
        }
        if (cancelled) return;
        queryClient.invalidateQueries({ queryKey: ['isPro', user.id] });
        toast.success('🎉 Welcome to Pro!', {
          description: 'Your payment was successful. You now have access to all premium features!',
          duration: 6000,
        });
        setTimeout(() => {
          if (!cancelled) navigate('/assistant', { replace: true });
        }, 2000);
      })();
      return () => { cancelled = true; };
    }

    if (canceled === 'true') {
      toast.error('Payment canceled', {
        description: 'Your payment was canceled. You can try again anytime.',
      });
    }
  }, [success, canceled, sessionId, user, queryClient, navigate]);

  const handleUpgrade = async (plan: string) => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    try {
      setLoading(plan);
      const data = await createCheckoutSession.mutateAsync({ plan });
      if (!data?.url) {
        throw new Error('No checkout URL returned');
      }
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout process');
      setLoading(null);
    }
  };

  // Payment success screen
  if (success === 'true') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 dark:bg-gray-900">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">Payment Successful! 🎉</CardTitle>
            <CardDescription className="text-base dark:text-gray-300">
              Welcome to Pro! Your account has been upgraded and you now have access to all premium features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold mb-3 text-green-800 dark:text-green-200 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                You now have access to:
              </h4>
              <ul className="space-y-2">
                {[
                  'AI Financial Assistant',
                  'Advanced Investment Tracking', 
                  'Subscription Management',
                  'Custom Reports & Analytics',
                  'Priority Support'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-green-700 dark:text-green-300">
                    <Check className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                size="lg" 
                onClick={() => navigate('/assistant')}
              >
                <Crown className="w-4 h-4 mr-2" />
                Try AI Assistant Now
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" 
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                Redirecting to AI Assistant in a moment...
              </p>
              <Loader2 className="w-4 h-4 animate-spin mx-auto mt-2 dark:text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main upgrade page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Upgrade to Pro
          </h1>
          <p className="text-xl text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
            Unlock advanced features and take control of your financial future with AI-powered insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <Card className="relative overflow-hidden border-2 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl dark:text-white">Pro Monthly</CardTitle>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-4">
                $9.99
                <span className="text-base font-normal text-muted-foreground dark:text-gray-400">/month</span>
              </div>
              <CardDescription className="dark:text-gray-300">Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {[
                  'AI Financial Assistant',
                  'Advanced Investment Tracking',
                  'Subscription Management', 
                  'Custom Reports & Analytics',
                  'Priority Support',
                  'Cancel anytime'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                    <span className="text-sm dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                size="lg"
                onClick={() => handleUpgrade('pro_monthly')}
                disabled={loading === 'pro_monthly'}
              >
                {loading === 'pro_monthly' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Crown className="w-4 h-4 mr-2" />
                )}
                Choose Monthly
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card className="relative overflow-hidden border-2 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 dark:bg-gray-800">
            <div className="absolute top-4 right-4">
              <Badge className="bg-purple-600 text-white">
                Save 20%
              </Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl dark:text-white">Pro Yearly</CardTitle>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-4">
                $99.99
                <span className="text-base font-normal text-muted-foreground dark:text-gray-400">/year</span>
              </div>
              <CardDescription className="dark:text-gray-300">
                <span className="line-through text-muted-foreground dark:text-gray-500">$119.88</span>
                <span className="ml-2 text-green-600 dark:text-green-400 font-medium">Save $19.89!</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {[
                  'Everything in Monthly',
                  'Priority AI responses',
                  'Advanced analytics',
                  'Export capabilities',
                  'Phone support',
                  '2 months free'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                    <span className="text-sm dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                size="lg"
                onClick={() => handleUpgrade('pro_yearly')}
                disabled={loading === 'pro_yearly'}
              >
                {loading === 'pro_yearly' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Crown className="w-4 h-4 mr-2" />
                )}
                Choose Yearly
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8 dark:text-white">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
              <h4 className="font-semibold mb-2 dark:text-white">What payment methods do you accept?</h4>
              <p className="text-muted-foreground dark:text-gray-300">We accept all major credit cards and debit cards through Stripe's secure payment processing.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
              <h4 className="font-semibold mb-2 dark:text-white">Is my data secure?</h4>
              <p className="text-muted-foreground dark:text-gray-300">Absolutely. We use bank-level encryption and never store your banking credentials. All data is encrypted and securely stored.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
              <h4 className="font-semibold mb-2 dark:text-white">Can I cancel anytime?</h4>
              <p className="text-muted-foreground dark:text-gray-300">Yes! You can cancel your subscription at any time through your account settings or billing portal. You'll retain access until the end of your billing period.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
              <h4 className="font-semibold mb-2 dark:text-white">What happens to my data if I cancel?</h4>
              <p className="text-muted-foreground dark:text-gray-300">Your data remains safe and accessible. You'll revert to the free plan with basic features, but all your financial data is preserved.</p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;