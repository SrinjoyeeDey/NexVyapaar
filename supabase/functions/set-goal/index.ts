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
    const { goal, currentMetrics } = await req.json();
    
    if (!goal) {
      return new Response(
        JSON.stringify({ error: 'Goal is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Setting goal:', goal);

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
            content: 'You are a business growth strategist. Create a detailed, actionable roadmap to achieve business goals. Return a JSON object with: steps (array of {week, action, metric}), timeframe (in weeks), estimatedImpact (percentage), and keyTips (array of strings).'
          },
          {
            role: 'user',
            content: `Goal: ${goal}. Current metrics: ${JSON.stringify(currentMetrics || {})}. Create a step-by-step plan.`
          }
        ],
        temperature: 0.5,
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
    
    console.log('AI goal response:', aiResponse);

    // Parse AI response
    let roadmap;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        roadmap = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback roadmap
        roadmap = {
          steps: [
            { week: 1, action: 'Analyze current performance', metric: 'Baseline metrics' },
            { week: 2, action: 'Implement initial optimizations', metric: '+10% efficiency' },
            { week: 4, action: 'Launch marketing campaign', metric: '+20% reach' },
            { week: 6, action: 'Review and iterate', metric: 'Target achievement' },
          ],
          timeframe: 6,
          estimatedImpact: 35,
          keyTips: [
            'Track progress weekly',
            'Stay consistent with actions',
            'Adjust strategy based on results'
          ]
        };
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      roadmap = {
        steps: [
          { week: 1, action: 'Set up tracking systems', metric: 'Baseline established' },
          { week: 2, action: 'Optimize operations', metric: '+15% improvement' },
          { week: 4, action: 'Scale successful strategies', metric: 'Target progress' },
        ],
        timeframe: 4,
        estimatedImpact: 25,
        keyTips: ['Focus on data-driven decisions', 'Be patient and consistent']
      };
    }

    return new Response(
      JSON.stringify({ roadmap }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in set-goal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});