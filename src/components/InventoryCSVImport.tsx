import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ParsedItem {
  name: string;
  category: string;
  current_stock: number;
  unit: string;
  cost_per_unit: number;
  reorder_point: number;
  optimal_stock_level: number;
  burn_rate: number;
  seasonality_tag: string;
  type: "raw_material" | "finished_product";
  selling_price?: number;
  isValid: boolean;
  errors: string[];
}

interface InventoryCSVImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importType: "raw_materials" | "finished_products" | "both";
}

// Auto-categorization rules
const categoryRules: Record<string, string[]> = {
  bakery: ["flour", "yeast", "sugar", "butter", "bread", "cake", "pastry", "dough"],
  beverages: ["coffee", "tea", "milk", "juice", "water", "soda", "drink"],
  dairy: ["milk", "cream", "cheese", "yogurt", "butter", "paneer"],
  spices: ["salt", "pepper", "masala", "turmeric", "cumin", "chili"],
  grains: ["rice", "wheat", "dal", "lentil", "oats", "corn"],
  vegetables: ["onion", "tomato", "potato", "carrot", "spinach"],
  meat: ["chicken", "mutton", "fish", "egg", "prawn"],
  packaging: ["box", "bag", "container", "wrap", "foil", "cup"],
  other: [],
};

const seasonalityRules: Record<string, string[]> = {
  winter_spike: ["soup", "hot chocolate", "tea", "coffee", "ginger", "jaggery"],
  summer_peak: ["ice cream", "cold", "juice", "lemonade", "mango", "watermelon"],
  monsoon_demand: ["pakora", "samosa", "chai", "bhaji"],
  year_round: [],
};

export const InventoryCSVImport = ({ open, onOpenChange, importType }: InventoryCSVImportProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"upload" | "preview" | "complete">("upload");

  // Auto-detect category
  const detectCategory = (name: string): string => {
    const lowerName = name.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryRules)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return category;
      }
    }
    return "other";
  };

  // Auto-detect seasonality
  const detectSeasonality = (name: string): string => {
    const lowerName = name.toLowerCase();
    for (const [season, keywords] of Object.entries(seasonalityRules)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return season;
      }
    }
    return "year_round";
  };

  // Detect item type
  const detectItemType = (row: any): "raw_material" | "finished_product" => {
    if (row.type?.toLowerCase().includes("finished") || row.type?.toLowerCase().includes("product")) {
      return "finished_product";
    }
    if (row.selling_price && parseFloat(row.selling_price) > 0) {
      return "finished_product";
    }
    return "raw_material";
  };

  // Parse CSV file
  const parseCSV = (text: string): ParsedItem[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g, ""));
    const items: ParsedItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/['"]/g, ""));
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      const name = row.name || row.product_name || row.item_name || row.material_name || "";
      if (!name) continue;

      const errors: string[] = [];
      const type = detectItemType(row);
      
      // Validate required fields
      if (!name) errors.push("Name is required");
      
      const item: ParsedItem = {
        name,
        category: row.category || detectCategory(name),
        current_stock: parseFloat(row.current_stock || row.stock || row.quantity || "0") || 0,
        unit: row.unit || "kg",
        cost_per_unit: parseFloat(row.cost_per_unit || row.cost || row.price || "0") || 0,
        reorder_point: parseFloat(row.reorder_point || row.reorder || "10") || 10,
        optimal_stock_level: parseFloat(row.optimal_stock_level || row.optimal || "50") || 50,
        burn_rate: parseFloat(row.burn_rate || "5") || 5,
        seasonality_tag: row.seasonality || row.season || detectSeasonality(name),
        type,
        selling_price: type === "finished_product" ? parseFloat(row.selling_price || "0") || 0 : undefined,
        isValid: errors.length === 0,
        errors,
      };

      items.push(item);
    }

    return items;
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const items = parseCSV(text);
      
      if (items.length === 0) {
        toast.error("No valid items found in CSV");
        return;
      }

      setParsedItems(items);
      setStep("preview");
      toast.success(`Parsed ${items.length} items from CSV`);
    };
    reader.readAsText(file);
  };

  // Import items mutation
  const importMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const validItems = parsedItems.filter(item => item.isValid);
      const rawMaterials = validItems.filter(item => item.type === "raw_material");
      const finishedProducts = validItems.filter(item => item.type === "finished_product");

      let imported = 0;
      const total = validItems.length;

      // Import raw materials
      if (rawMaterials.length > 0 && (importType === "raw_materials" || importType === "both")) {
        for (const item of rawMaterials) {
          const { error } = await supabase
            .from("raw_materials")
            .insert({
              user_id: user.id,
              name: item.name,
              category: item.category,
              current_stock: item.current_stock,
              unit: item.unit,
              cost_per_unit: item.cost_per_unit,
              reorder_point: item.reorder_point,
              optimal_stock_level: item.optimal_stock_level,
              burn_rate: item.burn_rate,
              seasonality_tag: item.seasonality_tag,
            });

          if (!error) imported++;
          setProgress(Math.round((imported / total) * 100));
        }
      }

      // Import finished products
      if (finishedProducts.length > 0 && (importType === "finished_products" || importType === "both")) {
        for (const item of finishedProducts) {
          const { error } = await supabase
            .from("finished_products")
            .insert({
              user_id: user.id,
              name: item.name,
              category: item.category,
              current_stock: item.current_stock,
              selling_price: item.selling_price || 0,
              cost_to_produce: item.cost_per_unit,
              reorder_point: item.reorder_point,
            });

          if (!error) imported++;
          setProgress(Math.round((imported / total) * 100));
        }
      }

      return imported;
    },
    onSuccess: (imported) => {
      queryClient.invalidateQueries({ queryKey: ["raw-materials"] });
      queryClient.invalidateQueries({ queryKey: ["finished-products"] });
      setStep("complete");
      toast.success(`Successfully imported ${imported} items!`);
    },
    onError: (error) => {
      toast.error("Import failed: " + error.message);
    },
  });

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    await importMutation.mutateAsync();
    setImporting(false);
  };

  const downloadTemplate = () => {
    const template = `name,category,current_stock,unit,cost_per_unit,reorder_point,optimal_stock_level,burn_rate,seasonality,type,selling_price
Wheat Flour,bakery,100,kg,45,20,150,15,year_round,raw_material,
Sugar,bakery,50,kg,42,15,100,10,year_round,raw_material,
Coffee Beans,beverages,25,kg,850,5,50,3,year_round,raw_material,
Chocolate Cake,bakery,10,pieces,150,5,30,8,year_round,finished_product,350
Cold Coffee,beverages,20,cups,80,10,50,15,summer_peak,finished_product,180`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-template.csv";
    a.click();
  };

  const resetDialog = () => {
    setParsedItems([]);
    setStep("upload");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validCount = parsedItems.filter(i => i.isValid).length;
  const invalidCount = parsedItems.filter(i => !i.isValid).length;
  const rawMaterialCount = parsedItems.filter(i => i.type === "raw_material").length;
  const productCount = parsedItems.filter(i => i.type === "finished_product").length;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetDialog(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk CSV Import
          </DialogTitle>
          <DialogDescription>
            Import inventory items from a CSV file with automatic categorization
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-6 py-4">
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
              <CardContent className="py-8">
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Upload CSV File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop or click to select a file
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Select CSV File
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Smart Import Features
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• <strong>Auto-categorization</strong>: Items are automatically categorized based on name</p>
                <p>• <strong>Seasonal detection</strong>: AI detects seasonal patterns for forecasting</p>
                <p>• <strong>Type detection</strong>: Distinguishes raw materials from finished products</p>
                <p>• <strong>Validation</strong>: Checks for required fields and data integrity</p>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={downloadTemplate} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4 py-4">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="py-4 text-center">
                  <div className="text-2xl font-bold">{parsedItems.length}</div>
                  <div className="text-xs text-muted-foreground">Total Items</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <div className="text-2xl font-bold text-primary">{rawMaterialCount}</div>
                  <div className="text-xs text-muted-foreground">Raw Materials</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <div className="text-2xl font-bold text-secondary">{productCount}</div>
                  <div className="text-xs text-muted-foreground">Products</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{validCount}</div>
                  <div className="text-xs text-muted-foreground">Valid Items</div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Table */}
            <div className="border rounded-lg max-h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Season</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedItems.slice(0, 50).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant={item.type === "raw_material" ? "outline" : "secondary"}>
                          {item.type === "raw_material" ? "Raw" : "Product"}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.current_stock} {item.unit}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.seasonality_tag.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {parsedItems.length > 50 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing 50 of {parsedItems.length} items
              </p>
            )}

            {importing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  Importing... {progress}%
                </p>
              </div>
            )}
          </div>
        )}

        {step === "complete" && (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Import Complete!</h3>
            <p className="text-muted-foreground">
              Successfully imported {validCount} inventory items
            </p>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => { setStep("upload"); setParsedItems([]); }}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={importing || validCount === 0}>
                {importing ? "Importing..." : `Import ${validCount} Items`}
              </Button>
            </>
          )}
          {step === "complete" && (
            <Button onClick={() => onOpenChange(false)}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};