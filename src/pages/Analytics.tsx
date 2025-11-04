import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, TrendingUp, BarChart3, LogOut } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { toast } from "sonner";

const Analytics = () => {
  const navigate = useNavigate();
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',');
        
        const data = rows.slice(1).map(row => {
          const values = row.split(',');
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim();
          });
          return obj;
        });

        setUploadedData(data);
        toast.success("CSV uploaded successfully!");
      } catch (error) {
        toast.error("Failed to parse CSV. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Sample data for visualization
  const sampleData = uploadedData.length > 0 ? uploadedData.slice(0, 10) : [
    { month: "Jan", sales: 4000, profit: 2400 },
    { month: "Feb", sales: 3000, profit: 1398 },
    { month: "Mar", sales: 2000, profit: 9800 },
    { month: "Apr", sales: 2780, profit: 3908 },
    { month: "May", sales: 1890, profit: 4800 },
    { month: "Jun", sales: 2390, profit: 3800 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold font-heading">SmartBizGrow</h1>
              <p className="text-xs text-muted-foreground">Analytics Dashboard</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Sales Data
            </CardTitle>
            <CardDescription>
              Drag and drop your CSV file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Drop your CSV file here, or click to select
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span>Browse Files</span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trends</CardTitle>
              <CardDescription>Monthly sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sampleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Profit Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Profit Analysis</CardTitle>
              <CardDescription>Monthly profit trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sampleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="profit" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI Forecasts (Premium Feature) */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI-Powered Forecasts
              <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                Premium
              </span>
            </CardTitle>
            <CardDescription>
              Get AI predictions for next month's sales and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="filter blur-sm pointer-events-none">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={sampleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={() => navigate("/billing")} size="lg" className="shadow-lg">
                Upgrade to Premium
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate("/advisor")} variant="default">
            AI Advisor →
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
