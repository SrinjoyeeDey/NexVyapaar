$path = 'c:\Users\SRINJOYEE\Desktop\nexvyapaar\bizgrow-spark\src\utils\translations.ts'
$lines = Get-Content $path
$newLines = @()

$analyticsBlock = @"
    analytics: {
      uploadTitle: "Upload Sales Data",
      uploadDesc: "Drag and drop your CSV file or click to browse",
      dropZone: "Drop your CSV file here, or click to select",
      browse: "Browse Files",
      salesTrends: "Sales Trends",
      salesTrendsDesc: "Monthly sales performance",
      profitAnalysis: "Profit Analysis",
      profitAnalysisDesc: "Monthly profit trends",
      aiForecast: "AI-Powered Forecasts",
      aiForecastDesc: "Get AI predictions for next month's sales and trends",
      premium: "Premium",
      upgrade: "Upgrade to Premium",
      backToDashboard: "Back to Dashboard",
      aiAdvisor: "AI Advisor",
      overview: "Overview",
      inventoryBreakdown: "Inventory Breakdown",
      successLogout: "Logged out successfully",
      errorCSV: "Please upload a CSV file",
      successCSV: "CSV uploaded successfully!",
      errorParse: "Failed to parse CSV. Please check the format."
    }
"@

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Fix 'en' closing syntax error (lines 310-311 approx)
    # We want to remove the extra '};' if it follows a '}' that closes 'en'
    # Pattern seen:
    # 309:   } (closes analytics)
    # 310: } (closes en)
    # 311: }; (extra)
    
    # Actually, we can just detect if we are at line 311 and it is '};' and previous was '}'
    if ($line.Trim() -eq '};' -and $i -gt 0 -and $lines[$i-1].Trim() -eq '}') {
        # Check if we are around line 311
        if ($i -gt 300 -and $i -lt 320) {
             # Skip this line to remove it
             continue
        }
    }
    
    # Fix 'en' closing: 'const en = { ... }' must end with '};'
    # If we have '}' at 310, change it to '};'
    if ($i -gt 300 -and $i -lt 320 -and $line.Trim() -eq '}') {
        # This is likely closing 'en'. Make sure it's '};'
        # But wait, 'translations' export follows.
        if ($i+1 -lt $lines.Count -and $lines[$i+1].Trim().StartsWith('export const translations')) {
             # Wait, there might be blank lines.
        }
        # Let's just ensure line 310 becomes '};'
        # $line = '};' 
        # Actually, let's look at the file content again.
        # 310: } 
        # 311: };
        # 313: export ...
        # If I remove 311, then 310 needs to be '};'
    }

    # Better logic for EN:
    if ($i -eq 310 -and $line.Trim() -eq '}') {
        $line = '};'
    }
    if ($i -eq 311 -and $line.Trim() -eq '};') {
        continue
    }

    # For other languages (hi, bn, mr, ta, te, gu), insert analytics before the language closing brace '  },'
    # Identified by: line is '  },' and PREVIOUS line was '    }' (closing purchaseOrders) AND we are inside 'translations' object.
    
    if ($line.Trim() -eq '},') {
         if ($i -gt 0 -and $lines[$i-1].Trim() -eq '}') {
              # Check if we are in translations object (after line 313)
              if ($i -gt 315) {
                   # Check if this isn't 'en' (which we handled) or the end of 'translations' object
                   # 'translations' object ends with '};' (line ~1980) or '  gu: { ... },'
                   
                   # We need to insert analytics block before this '  },'
                   # But first we need to add a comma to the previous line '    }' -> '    },'
                   
                   # Modify previous line in $newLines
                   $prevIndex = $newLines.Count - 1
                   if ($newLines[$prevIndex].Trim() -eq '}') {
                       $newLines[$prevIndex] = '    },'
                       $newLines += $analyticsBlock
                   }
              }
         }
    }

    $newLines += $line
}

$newLines | Set-Content $path -Encoding UTF8
Write-Host "File updated."
