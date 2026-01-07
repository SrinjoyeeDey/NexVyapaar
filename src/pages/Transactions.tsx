import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  LogOut,
  Download,
  Filter,
  TrendingUp,
  Calendar,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { isDemoMode } from "@/hooks/useDemoMode";

// Hardcoded demo transactions
const DEMO_TRANSACTIONS = [
  { id: "t1", amount: 25000, currency: "₹", payment_gateway: "Bank Transfer", transaction_id: "TXN_88776655", status: "completed", subscription_type: "Stock Purchase: Metro", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
  { id: "t2", amount: 1500, currency: "₹", payment_gateway: "UPI", transaction_id: "TXN_12345678", status: "completed", subscription_type: "Electricity Bill", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
  { id: "t3", amount: 12000, currency: "₹", payment_gateway: "Cash", transaction_id: "TXN_87654321", status: "completed", subscription_type: "Shop Rent (Advance)", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
  { id: "t4", amount: 500, currency: "₹", payment_gateway: "Razorpay", transaction_id: "TXN_11223344", status: "failed", subscription_type: "Software Subscription", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString() },
  { id: "t5", amount: 500, currency: "₹", payment_gateway: "Razorpay", transaction_id: "TXN_11223355", status: "completed", subscription_type: "Software Subscription", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12.1).toISOString() },
  { id: "t6", amount: 3500, currency: "₹", payment_gateway: "UPI", transaction_id: "TXN_99887766", status: "pending", subscription_type: "Internet Bill", created_at: new Date().toISOString() },
  { id: "t7", amount: 8000, currency: "₹", payment_gateway: "Bank Transfer", transaction_id: "TXN_55443322", status: "completed", subscription_type: "Stock Purchase: Amul", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString() },
  { id: "t8", amount: 200, currency: "₹", payment_gateway: "Cash", transaction_id: "TXN_33445566", status: "completed", subscription_type: "Tea/Snacks Expense", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString() },
  { id: "t9", amount: 4500, currency: "₹", payment_gateway: "UPI", transaction_id: "TXN_77665544", status: "completed", subscription_type: "Worker Salary (Part)", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString() },
];

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  payment_gateway: string;
  transaction_id: string;
  status: string;
  subscription_type?: string;
  created_at: string;
}

const Transactions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  const { user } = useAuth();

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    setLoading(true);

    // Demo Mode Logic
    if (isDemoMode()) {
      setTimeout(() => {
        setTransactions(DEMO_TRANSACTIONS);
        const total = DEMO_TRANSACTIONS.reduce((sum, t) => sum + Number(t.amount), 0);
        setTotalSpent(total);
        setLoading(false);
      }, 500); // Fake delay
      return;
    }

    if (!user) {
      // If no user and not demo mode, we shouldn't be here (Protected Route handles it)
      // but just in case, stop loading
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      });
    } else {
      setTransactions(data || []);
      const total = (data || []).reduce((sum, t) => sum + Number(t.amount), 0);
      setTotalSpent(total);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-700 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "failed": return "bg-red-500/10 text-red-700 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  const exportTransactions = () => {
    const csv = [
      ["Date", "Amount", "Gateway", "Status", "Transaction ID"],
      ...transactions.map(t => [
        format(new Date(t.created_at), "PPP"),
        `${t.currency} ${t.amount}`,
        t.payment_gateway,
        t.status,
        t.transaction_id
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();

    toast({
      title: "Downloaded! 📥",
      description: "Transaction history exported successfully"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">Transaction History</h1>
              <p className="text-xs text-muted-foreground">Track all your payments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{transactions.length}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-secondary">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {transactions.filter(t =>
                  new Date(t.created_at).getMonth() === new Date().getMonth()
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">All Transactions</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={exportTransactions}
              disabled={transactions.length === 0}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No transactions yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your payment history will appear here
                </p>
                <Button onClick={() => navigate("/billing")}>
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          ) : (
            transactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                          {transaction.subscription_type ? `${transaction.subscription_type}` : "Payment"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), "PPP 'at' p")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          via {transaction.payment_gateway.charAt(0).toUpperCase() + transaction.payment_gateway.slice(1)} • ID: {transaction.transaction_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-slate-900 mb-1">
                        {transaction.currency} {transaction.amount}
                      </div>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Transactions;