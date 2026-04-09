import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { itemId } = await req.json();
    if (!itemId) return new Response(JSON.stringify({ error: 'itemId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) return new Response(JSON.stringify({ error: 'FIRECRAWL_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: item, error: fetchErr } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (fetchErr || !item) return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    if (item.type !== 'link' && item.type !== 'github') {
      return new Response(JSON.stringify({ error: 'Item is not a link or github type' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const url = item.source_url;
    if (!url) return new Response(JSON.stringify({ error: 'No source URL' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    console.log('Scraping URL:', url);

    // Scrape with Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'links'],
        onlyMainContent: true,
      }),
    });

    const scrapeData = await scrapeResponse.json();
    if (!scrapeResponse.ok) {
      console.error('Firecrawl error:', scrapeData);
      return new Response(JSON.stringify({ error: 'Firecrawl error', details: scrapeData }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
    const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};
    const title = metadata.title || item.title;

    // For GitHub repos, try to get the tree
    let githubTree = null;
    if (item.type === 'github') {
      try {
        const repoMatch = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
        if (repoMatch) {
          const repoPath = repoMatch[1].replace(/\.git$/, '');
          const treeResponse = await fetch(`https://api.github.com/repos/${repoPath}/git/trees/HEAD?recursive=1`, {
            headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Lovable-Funnel' },
          });
          if (treeResponse.ok) {
            const treeData = await treeResponse.json();
            githubTree = treeData.tree?.slice(0, 200).map((f: any) => f.path) || [];
          }
        }
      } catch (e) {
        console.error('GitHub tree error:', e);
      }
    }

    // Use AI to summarize + extract keywords + suggest groups
    const aiPrompt = item.type === 'github'
      ? `Analyze this GitHub repository content. Provide:
1. A concise 2-3 sentence summary that goes beyond the README - what does this project actually do technically?
2. Extract 5-10 relevant keywords/tags
3. Suggest 1-3 category groups this would fit into

Content: ${markdown.slice(0, 8000)}
${githubTree ? `\nProject structure: ${JSON.stringify(githubTree.slice(0, 50))}` : ''}`
      : `Analyze this web content. Provide:
1. A concise 2-3 sentence summary
2. Extract 5-10 relevant keywords/tags
3. Suggest 1-3 category groups this would fit into

Title: ${title}
Content: ${markdown.slice(0, 8000)}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You extract structured information from web content. Respond with JSON only: {"summary": "...", "keywords": ["..."], "suggested_groups": ["..."]}' },
          { role: 'user', content: aiPrompt },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'extract_info',
            description: 'Extract structured info from content',
            parameters: {
              type: 'object',
              properties: {
                summary: { type: 'string', description: 'Concise 2-3 sentence summary' },
                keywords: { type: 'array', items: { type: 'string' }, description: '5-10 keywords' },
                suggested_groups: { type: 'array', items: { type: 'string' }, description: '1-3 group names' },
              },
              required: ['summary', 'keywords', 'suggested_groups'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'extract_info' } },
      }),
    });

    let aiSummary = '';
    let keywords: string[] = [];
    let suggestedGroups: string[] = [];

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      try {
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          const args = JSON.parse(toolCall.function.arguments);
          aiSummary = args.summary || '';
          keywords = args.keywords || [];
          suggestedGroups = args.suggested_groups || [];
        }
      } catch (e) {
        console.error('AI parse error:', e);
      }
    } else {
      console.error('AI error:', await aiResponse.text());
    }

    // Update item
    const { error: updateErr } = await supabase
      .from('items')
      .update({
        title: title || item.title,
        extracted_content: markdown.slice(0, 50000),
        summary: aiSummary,
        keywords,
        firecrawl_data: scrapeData,
        github_tree: githubTree,
        processed: true,
      })
      .eq('id', itemId);

    if (updateErr) console.error('Update error:', updateErr);

    // Auto-create suggested groups and assign
    for (const groupName of suggestedGroups) {
      const { data: existing } = await supabase.from('groups').select('id').eq('name', groupName).single();
      let groupId = existing?.id;
      if (!groupId) {
        const colors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#22c55e', '#ec4899', '#3b82f6'];
        const { data: newGroup } = await supabase
          .from('groups')
          .insert({ name: groupName, color: colors[Math.floor(Math.random() * colors.length)] })
          .select('id')
          .single();
        groupId = newGroup?.id;
      }
      if (groupId) {
        await supabase.from('item_groups').upsert({ item_id: itemId, group_id: groupId });
      }
    }

    // Auto-create tags and assign
    for (const kw of keywords.slice(0, 5)) {
      const tagName = kw.toLowerCase().trim();
      const { data: existing } = await supabase.from('tags').select('id').eq('name', tagName).single();
      let tagId = existing?.id;
      if (!tagId) {
        const { data: newTag } = await supabase
          .from('tags')
          .insert({ name: tagName, color: '#06b6d4' })
          .select('id')
          .single();
        tagId = newTag?.id;
      }
      if (tagId) {
        await supabase.from('item_tags').upsert({ item_id: itemId, tag_id: tagId });
      }
    }

    return new Response(JSON.stringify({ ok: true, summary: aiSummary, keywords, suggestedGroups }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('process-intake error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
