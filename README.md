# Wise Wallet - Client

A modern React/TypeScript frontend for the Wise Wallet financial management application.

## 🚀 Features

- **Modern UI/UX**: Built with React, TypeScript, and Tailwind CSS
- **Financial Dashboard**: Real-time spending insights and transaction tracking
- **AI-Powered Insights**: Intelligent financial analysis and recommendations
- **Bank Integration**: Secure connection to financial institutions via Plaid
- **Subscription Management**: Track and manage recurring payments
- **Investment Tracking**: Monitor portfolio performance
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Backend Integration**: Supabase
- **Banking API**: Plaid
- **Payment Processing**: Stripe
- **Authentication**: Supabase Auth

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the client directory with the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_PLAID_PUBLIC_KEY=your_plaid_public_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ai/             # AI-related components
│   ├── auth/           # Authentication components
│   ├── financial/      # Financial dashboard components
│   ├── layout/         # Layout and navigation components
│   ├── settings/       # Settings and configuration components
│   └── ui/             # Base UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Page components
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
└── integrations/       # Third-party service integrations
```

## 🎨 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration can be found in `tailwind.config.ts`.

### shadcn/ui Components
UI components are built using shadcn/ui. To add new components:
```bash
npx shadcn@latest add [component-name]
```

### Environment Variables
Make sure to configure all required environment variables before running the application. See the installation section for details.

## 🔌 API Integration

### Supabase
- Database operations
- Real-time subscriptions
- Authentication

### Plaid
- Bank account linking
- Transaction fetching
- Account balance retrieval

### Stripe
- Payment processing
- Subscription management
- Webhook handling

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices. Key mobile features include:
- Touch-friendly interface
- Swipe gestures for navigation
- Optimized layouts for small screens
- Progressive Web App (PWA) capabilities

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables

### Manual Deployment
1. Build the project: `npm run build`
2. Serve the `dist` folder with your preferred web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the troubleshooting guide

## 🔗 Related Links

- [Backend API Documentation](../server/README.md)
- [Project Documentation](../README.md)
- [API Documentation](../docs/api.md)
