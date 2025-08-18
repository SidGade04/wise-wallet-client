import { User, Transaction, Subscription, Category } from '@/types';
import { subDays, addDays } from 'date-fns';

export const mockUser: User = {
  id: '1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  linkedBankAccounts: ['account_1', 'account_2'],
  createdAt: new Date('2023-01-15')
};

export const categories: Category[] = [
  { id: '1', name: 'Food & Dining', color: '#FF6B6B', icon: '🍽️' },
  { id: '2', name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
  { id: '3', name: 'Shopping', color: '#45B7D1', icon: '🛍️' },
  { id: '4', name: 'Entertainment', color: '#96CEB4', icon: '🎬' },
  { id: '5', name: 'Bills & Utilities', color: '#FFEAA7', icon: '💡' },
  { id: '6', name: 'Healthcare', color: '#DDA0DD', icon: '🏥' },
  { id: '7', name: 'Education', color: '#98D8C8', icon: '📚' },
  { id: '8', name: 'Travel', color: '#F7DC6F', icon: '✈️' },
  { id: '9', name: 'Subscriptions', color: '#BB8FCE', icon: '📱' }
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    userId: '1',
    amount: -87.32,
    merchant: 'Whole Foods Market',
    category: 'Food & Dining',
    date: subDays(new Date(), 1),
    description: 'Grocery shopping',
    accountId: 'account_1'
  },
  {
    id: '2',
    userId: '1',
    amount: -12.99,
    merchant: 'Netflix',
    category: 'Subscriptions',
    date: subDays(new Date(), 2),
    description: 'Monthly subscription',
    accountId: 'account_1',
    isRecurring: true
  },
  {
    id: '3',
    userId: '1',
    amount: -45.67,
    merchant: 'Shell Gas Station',
    category: 'Transportation',
    date: subDays(new Date(), 3),
    description: 'Gas fill-up',
    accountId: 'account_1'
  },
  {
    id: '4',
    userId: '1',
    amount: -156.43,
    merchant: 'Amazon',
    category: 'Shopping',
    date: subDays(new Date(), 4),
    description: 'Online shopping',
    accountId: 'account_2'
  },
  {
    id: '5',
    userId: '1',
    amount: -89.99,
    merchant: 'Nike Store',
    category: 'Shopping',
    date: subDays(new Date(), 5),
    description: 'Running shoes',
    accountId: 'account_1'
  },
  {
    id: '6',
    userId: '1',
    amount: -23.45,
    merchant: 'Starbucks',
    category: 'Food & Dining',
    date: subDays(new Date(), 6),
    description: 'Coffee and pastry',
    accountId: 'account_1'
  },
  {
    id: '7',
    userId: '1',
    amount: -567.89,
    merchant: 'Rent Payment',
    category: 'Bills & Utilities',
    date: subDays(new Date(), 7),
    description: 'Monthly rent',
    accountId: 'account_2'
  },
  {
    id: '8',
    userId: '1',
    amount: -19.99,
    merchant: 'Spotify',
    category: 'Subscriptions',
    date: subDays(new Date(), 8),
    description: 'Music streaming',
    accountId: 'account_1',
    isRecurring: true
  }
];

export const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    userId: '1',
    merchant: 'Netflix',
    amount: 12.99,
    frequency: 'monthly',
    nextBillingDate: addDays(new Date(), 22),
    isActive: true,
    category: 'Entertainment',
    lastChargeDate: subDays(new Date(), 2)
  },
  {
    id: '2',
    userId: '1',
    merchant: 'Spotify Premium',
    amount: 19.99,
    frequency: 'monthly',
    nextBillingDate: addDays(new Date(), 15),
    isActive: true,
    category: 'Entertainment',
    lastChargeDate: subDays(new Date(), 8)
  },
  {
    id: '3',
    userId: '1',
    merchant: 'Adobe Creative Cloud',
    amount: 52.99,
    frequency: 'monthly',
    nextBillingDate: addDays(new Date(), 10),
    isActive: true,
    category: 'Software',
    lastChargeDate: subDays(new Date(), 20)
  },
  {
    id: '4',
    userId: '1',
    merchant: 'Amazon Prime',
    amount: 139,
    frequency: 'yearly',
    nextBillingDate: addDays(new Date(), 180),
    isActive: true,
    category: 'Shopping',
    lastChargeDate: subDays(new Date(), 185)
  },
  {
    id: '5',
    userId: '1',
    merchant: 'Planet Fitness',
    amount: 24.99,
    frequency: 'monthly',
    nextBillingDate: addDays(new Date(), 5),
    isActive: false,
    category: 'Health & Fitness',
    lastChargeDate: subDays(new Date(), 25)
  }
];

export const mockHoldings = [
  { security_id: "1", ticker: "AAPL", name: "Apple Inc.", quantity: 10, price: 150.25, value: 1502.50 },
  { security_id: "2", ticker: "GOOGL", name: "Alphabet Inc.", quantity: 5, price: 2500.00, value: 12500.00 },
  { security_id: "3", ticker: "TSLA", name: "Tesla Inc.", quantity: 8, price: 800.75, value: 6406.00 },
  { security_id: "4", ticker: "AMZN", name: "Amazon.com Inc.", quantity: 12, price: 3300.50, value: 39606.00 },
  { security_id: "5", ticker: "MSFT", name: "Microsoft Corp.", quantity: 15, price: 280.10, value: 4201.50 },
  { security_id: "6", ticker: "NFLX", name: "Netflix Inc.", quantity: 7, price: 525.40, value: 3677.80 },
  { security_id: "7", ticker: "NVDA", name: "NVIDIA Corp.", quantity: 20, price: 720.15, value: 14403.00 },
  { security_id: "8", ticker: "META", name: "Meta Platforms Inc.", quantity: 6, price: 320.80, value: 1924.80 },
  { security_id: "9", ticker: "BABA", name: "Alibaba Group Holding Ltd.", quantity: 18, price: 95.60, value: 1720.80 },
  { security_id: "10", ticker: "V", name: "Visa Inc.", quantity: 14, price: 215.25, value: 3013.50 },
  { security_id: "11", ticker: "JPM", name: "JPMorgan Chase & Co.", quantity: 10, price: 155.90, value: 1559.00 },
  { security_id: "12", ticker: "XOM", name: "Exxon Mobil Corp.", quantity: 25, price: 105.40, value: 2635.00 },
  { security_id: "13", ticker: "KO", name: "Coca-Cola Co.", quantity: 50, price: 58.75, value: 2937.50 },
  { security_id: "14", ticker: "PEP", name: "PepsiCo Inc.", quantity: 40, price: 175.30, value: 7012.00 },
  { security_id: "15", ticker: "DIS", name: "The Walt Disney Co.", quantity: 22, price: 92.45, value: 2033.90 }
];

export const mockInvestmentTransactions = [
  { investment_transaction_id: "1", date: "2024-01-15", ticker: "AAPL", type: "buy", quantity: 10, price: 150.25, amount: 1502.50, fees: 1.99 },
  { investment_transaction_id: "2", date: "2024-01-10", ticker: "GOOGL", type: "buy", quantity: 5, price: 2500.00, amount: 12500.00, fees: 4.99 },
  { investment_transaction_id: "3", date: "2024-02-01", ticker: "TSLA", type: "buy", quantity: 8, price: 800.75, amount: 6406.00, fees: 3.50 },
  { investment_transaction_id: "4", date: "2024-02-10", ticker: "AMZN", type: "buy", quantity: 12, price: 3300.50, amount: 39606.00, fees: 6.99 },
  { investment_transaction_id: "5", date: "2024-02-15", ticker: "MSFT", type: "buy", quantity: 15, price: 280.10, amount: 4201.50, fees: 2.50 },
  { investment_transaction_id: "6", date: "2024-03-01", ticker: "NFLX", type: "buy", quantity: 7, price: 525.40, amount: 3677.80, fees: 2.75 },
  { investment_transaction_id: "7", date: "2024-03-05", ticker: "NVDA", type: "buy", quantity: 20, price: 720.15, amount: 14403.00, fees: 5.20 },
  { investment_transaction_id: "8", date: "2024-03-12", ticker: "META", type: "buy", quantity: 6, price: 320.80, amount: 1924.80, fees: 1.80 },
  { investment_transaction_id: "9", date: "2024-03-15", ticker: "BABA", type: "buy", quantity: 18, price: 95.60, amount: 1720.80, fees: 1.20 },
  { investment_transaction_id: "10", date: "2024-03-20", ticker: "V", type: "buy", quantity: 14, price: 215.25, amount: 3013.50, fees: 2.00 },
  { investment_transaction_id: "11", date: "2024-03-25", ticker: "JPM", type: "buy", quantity: 10, price: 155.90, amount: 1559.00, fees: 1.50 },
  { investment_transaction_id: "12", date: "2024-04-01", ticker: "XOM", type: "buy", quantity: 25, price: 105.40, amount: 2635.00, fees: 2.10 },
  { investment_transaction_id: "13", date: "2024-04-05", ticker: "KO", type: "buy", quantity: 50, price: 58.75, amount: 2937.50, fees: 1.00 },
  { investment_transaction_id: "14", date: "2024-04-10", ticker: "PEP", type: "buy", quantity: 40, price: 175.30, amount: 7012.00, fees: 2.25 },
  { investment_transaction_id: "15", date: "2024-04-15", ticker: "DIS", type: "buy", quantity: 22, price: 92.45, amount: 2033.90, fees: 1.75 },
  { investment_transaction_id: "16", date: "2024-05-01", ticker: "AAPL", type: "sell", quantity: 3, price: 155.20, amount: 465.60, fees: 1.50 },
  { investment_transaction_id: "17", date: "2024-05-10", ticker: "MSFT", type: "sell", quantity: 5, price: 290.50, amount: 1452.50, fees: 1.80 },
  { investment_transaction_id: "18", date: "2024-05-15", ticker: "KO", type: "dividend", quantity: 50, price: 0.45, amount: 22.50, fees: 0.00 },
  { investment_transaction_id: "19", date: "2024-06-01", ticker: "V", type: "dividend", quantity: 14, price: 0.50, amount: 7.00, fees: 0.00 },
  { investment_transaction_id: "20", date: "2024-06-15", ticker: "NVDA", type: "sell", quantity: 5, price: 750.00, amount: 3750.00, fees: 2.20 }
];
