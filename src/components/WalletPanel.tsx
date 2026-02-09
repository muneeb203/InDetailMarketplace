import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Detailer } from '../types';
import { 
  DollarSign, Plus, TrendingUp, TrendingDown, 
  CreditCard, Calendar, CheckCircle2, XCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletPanelProps {
  detailer: Detailer;
  onBuyCredits: () => void;
  expanded?: boolean;
}

export function WalletPanel({ detailer, onBuyCredits, expanded = false }: WalletPanelProps) {
  const [showTransactions, setShowTransactions] = useState(false);

  // Mock recent transactions
  const transactions: Transaction[] = [
    {
      id: 't1',
      type: 'debit',
      amount: 7.50,
      description: 'Lead accepted - SUV Full Detail',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'completed',
    },
    {
      id: 't2',
      type: 'credit',
      amount: 50.00,
      description: 'Credit package purchased',
      date: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: 'completed',
    },
    {
      id: 't3',
      type: 'debit',
      amount: 5.00,
      description: 'Lead accepted - Sedan Exterior Wash',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'completed',
    },
    {
      id: 't4',
      type: 'credit',
      amount: 100.00,
      description: 'Credit package purchased',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'completed',
    },
  ];

  const recentTransactions = transactions.slice(0, 5);
  const thisMonthSpending = transactions
    .filter(t => t.type === 'debit' && t.date.getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);

  const walletStatus = detailer.wallet > 50 ? 'good' : detailer.wallet > 20 ? 'medium' : 'low';

  return (
    <Card className="overflow-hidden border-2">
      <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              Credit Wallet
            </CardTitle>
            <CardDescription>Available balance for accepting leads</CardDescription>
          </div>
          <Badge 
            className={`
              ${walletStatus === 'good' ? 'bg-green-100 text-green-700 border-green-200' : ''}
              ${walletStatus === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
              ${walletStatus === 'low' ? 'bg-red-100 text-red-700 border-red-200' : ''}
            `}
          >
            {walletStatus === 'good' && 'Healthy'}
            {walletStatus === 'medium' && 'Low'}
            {walletStatus === 'low' && 'Critical'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Balance Display */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 mb-2">Current Balance</p>
          <motion.p
            key={detailer.wallet}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-4xl mb-2"
          >
            ${detailer.wallet.toFixed(2)}
          </motion.p>
          <p className="text-xs text-gray-500">
            {Math.floor(detailer.wallet / (detailer.isPro ? 5.625 : 7.5))} leads available
            {detailer.isPro ? ' (Pro rate)' : ''}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-600">This Month</span>
            </div>
            <p className="text-sm">${thisMonthSpending.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Spent on leads</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-600">Average</span>
            </div>
            <p className="text-sm">${(detailer.isPro ? 5.625 : 7.5).toFixed(2)}</p>
            <p className="text-xs text-gray-500">Per lead</p>
          </div>
        </div>

        {/* Buy Credits Button */}
        <Button
          onClick={onBuyCredits}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Buy More Credits
        </Button>

        {/* Low Balance Warning */}
        {walletStatus === 'low' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-3"
          >
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-900 mb-1">
                  Low balance warning
                </p>
                <p className="text-xs text-red-700">
                  You may not have enough credits to accept new leads. Consider adding credits to avoid missing opportunities.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Transactions Toggle */}
        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="w-full text-sm text-blue-600 hover:text-blue-700 py-2 flex items-center justify-center gap-1"
        >
          {showTransactions ? 'Hide' : 'View'} Recent Transactions
          <motion.span
            animate={{ rotate: showTransactions ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▼
          </motion.span>
        </button>

        {/* Transactions List */}
        <AnimatePresence>
          {showTransactions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2 overflow-hidden"
            >
              {recentTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-start gap-2 flex-1">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                        ${transaction.type === 'credit' 
                          ? 'bg-green-100' 
                          : 'bg-red-100'
                        }
                      `}>
                        {transaction.type === 'credit' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-1">{transaction.description}</p>
                        <p className="text-xs text-gray-500">
                          {transaction.date.toLocaleDateString()} at{' '}
                          {transaction.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className={`
                        text-sm
                        ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}
                      `}>
                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      {transaction.status === 'completed' && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                          Done
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pro Savings Banner */}
        {!detailer.isPro && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-900 mb-1">
                  Save 25% on every lead
                </p>
                <p className="text-xs text-yellow-700 mb-2">
                  Pro members pay only $5.63 per lead instead of $7.50
                </p>
                <Button size="sm" variant="outline" className="text-xs">
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
