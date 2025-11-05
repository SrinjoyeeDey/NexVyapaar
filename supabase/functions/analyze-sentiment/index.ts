import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing sentiment for text:', text.substring(0, 100));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are a sentiment analysis expert. Analyze customer feedback and return a JSON object with: overall (positive/negative/neutral), score (0-1 confidence), emotions (array of {name, value} where value is 0-100). Be concise and accurate.'
          },
          {
            role: 'user',
            content: `Analyze this customer feedback: "${text}"`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway returned ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI sentiment response:', aiResponse);

    // Parse AI response - try to extract JSON
    let sentiment;
    try {
      // Try to find JSON in the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        sentiment = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create sentiment from text analysis
        const isPositive = aiResponse.toLowerCase().includes('positive');
        const isNegative = aiResponse.toLowerCase().includes('negative');
        
        sentiment = {
          overall: isPositive ? 'positive' : (isNegative ? 'negative' : 'neutral'),
          score: 0.85,
          emotions: [
            { name: 'Happy', value: isPositive ? 75 : 20 },
            { name: 'Satisfied', value: isPositive ? 65 : 30 },
            { name: 'Neutral', value: 40 },
            { name: 'Frustrated', value: isNegative ? 70 : 15 },
          ]
        };
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a default sentiment
      sentiment = {
        overall: 'neutral',
        score: 0.5,
        emotions: [
          { name: 'Happy', value: 40 },
          { name: 'Satisfied', value: 50 },
          { name: 'Neutral', value: 60 },
          { name: 'Frustrated', value: 30 },
        ]
      };
    }

    return new Response(
      JSON.stringify({ sentiment }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-sentiment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});