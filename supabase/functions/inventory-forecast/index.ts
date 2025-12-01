import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, inventoryData } = await req.json();
    console.log('Generating forecast for:', productName, inventoryData);

    if (!productName || !inventoryData) {
      return new Response(
        JSON.stringify({ error: 'Product name and inventory data are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Prepare context for AI
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const nextQuarter = getNextQuarterMonths();
    
    const prompt = `Analyze this inventory data for "${productName}" and provide a concise forecast:

Sales: ₹${inventoryData.total_sales}
Burn Rate: ${inventoryData.burn_rate} units/week
Seasonality: ${inventoryData.seasonality_tag}
Current Waste: ${inventoryData.waste_quantity} units
Total Quantity Sold: ${inventoryData.total_quantity} units
Current Month: ${currentMonth}

Provide a JSON response with:
1. "summary": A 1-sentence forecast for the next quarter (${nextQuarter.join(', ')})
2. "stockRecommendation": Specific quantity to stock and when
3. "profitEstimate": Expected profit increase (e.g., "+₹3,000")
4. "tips": Array of 2-3 actionable tips to reduce waste or increase profit

Be specific with numbers and dates. Consider seasonality patterns.`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert inventory analyst for small businesses. Provide practical, data-driven forecasts in JSON format. Be specific and actionable.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway responded with status ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', aiData);

    let forecastData;
    try {
      const content = aiData.choices[0].message.content;
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        forecastData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: Create structured response from text
        forecastData = {
          summary: content.split('\n')[0] || "Demand expected to remain steady",
          stockRecommendation: `Stock 20-30 units by mid-${nextQuarter[0]}`,
          profitEstimate: "+₹2,500",
          tips: [
            "Monitor daily sales patterns",
            "Consider bulk purchasing discounts",
            "Implement FIFO inventory system"
          ]
        };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Provide fallback forecast
      forecastData = generateFallbackForecast(productName, inventoryData, nextQuarter);
    }

    return new Response(
      JSON.stringify(forecastData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in inventory-forecast function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to get next quarter months
function getNextQuarterMonths(): string[] {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonth = new Date().getMonth();
  const nextMonths = [];
  for (let i = 1; i <= 3; i++) {
    nextMonths.push(months[(currentMonth + i) % 12]);
  }
  return nextMonths;
}

// Fallback forecast generator
function generateFallbackForecast(
  productName: string,
  inventoryData: any,
  nextQuarter: string[]
): any {
  const avgSalesPerWeek = inventoryData.burn_rate || 10;
  const estimatedQuarterlySales = avgSalesPerWeek * 13; // 13 weeks in a quarter
  const profitMargin = 0.3; // 30% assumed margin
  const estimatedProfit = Math.round(estimatedQuarterlySales * profitMargin * 100);

  let seasonalAdjustment = 1.0;
  if (inventoryData.seasonality_tag === 'winter_spike') {
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 10 || currentMonth <= 1) seasonalAdjustment = 1.25;
  } else if (inventoryData.seasonality_tag === 'summer_peak') {
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 4 && currentMonth <= 8) seasonalAdjustment = 1.25;
  }

  const adjustedStock = Math.round(estimatedQuarterlySales * seasonalAdjustment);

  return {
    summary: `${productName} demand expected to ${seasonalAdjustment > 1 ? 'increase by 25%' : 'remain steady'} in ${nextQuarter.join(', ')}. Stock ${adjustedStock} units for optimal coverage.`,
    stockRecommendation: `Order ${adjustedStock} units by mid-${nextQuarter[0]} to avoid shortages. Consider weekly batches of ${Math.round(avgSalesPerWeek * seasonalAdjustment)} units.`,
    profitEstimate: `+₹${estimatedProfit.toLocaleString()}`,
    tips: [
      inventoryData.waste_quantity > 5 
        ? `Current waste is high (${inventoryData.waste_quantity} units). Reduce batch sizes by 20% to minimize losses.`
        : 'Waste levels are acceptable. Maintain current ordering schedule.',
      seasonalAdjustment > 1 
        ? `This is peak season for ${productName}. Stock up 25% more than usual.`
        : 'Demand is steady. Focus on maintaining consistent inventory levels.',
      `Consider freezing or preserving excess stock to extend shelf life and reduce waste.`
    ]
  };
}
