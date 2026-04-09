import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MAX_RUNTIME_MS = 55_000;
const MIN_REMAINING_MS = 5_000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
  if (!TELEGRAM_API_KEY) return new Response(JSON.stringify({ error: 'TELEGRAM_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let totalProcessed = 0;

  try {
    const { data: state, error: stateErr } = await supabase
      .from('telegram_bot_state')
      .select('update_offset')
      .eq('id', 1)
      .single();

    if (stateErr) return new Response(JSON.stringify({ error: stateErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    let currentOffset = state.update_offset;

    while (true) {
      const elapsed = Date.now() - startTime;
      const remainingMs = MAX_RUNTIME_MS - elapsed;
      if (remainingMs < MIN_REMAINING_MS) break;

      const timeout = Math.min(50, Math.floor(remainingMs / 1000) - 5);
      if (timeout < 1) break;

      const response = await fetch(`${GATEWAY_URL}/getUpdates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': TELEGRAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offset: currentOffset,
          timeout,
          allowed_updates: ['message'],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Telegram getUpdates error:', data);
        return new Response(JSON.stringify({ error: data }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const updates = data.result ?? [];
      if (updates.length === 0) continue;

      // Store raw telegram messages
      const rows = updates
        .filter((u: any) => u.message)
        .map((u: any) => ({
          update_id: u.update_id,
          chat_id: u.message.chat.id,
          text: u.message.text ?? null,
          raw_update: u,
        }));

      if (rows.length > 0) {
        const { error: insertErr } = await supabase
          .from('telegram_messages')
          .upsert(rows, { onConflict: 'update_id' });

        if (insertErr) console.error('Insert error:', insertErr);

        // Process each message into an item
        for (const update of updates) {
          const msg = update.message;
          if (!msg) continue;

          const text = msg.text || '';
          const isUrl = /^https?:\/\/\S+$/.test(text.trim());
          const isGithub = isUrl && text.includes('github.com');

          // Create item
          const item: any = {
            telegram_message_id: msg.message_id,
            telegram_chat_id: msg.chat.id,
            created_at: new Date(msg.date * 1000).toISOString(),
          };

          if (msg.document || msg.photo || msg.video || msg.audio) {
            item.type = 'file';
            item.title = msg.document?.file_name || 'File';
            item.content = msg.caption || text;
            item.file_name = msg.document?.file_name;
            item.file_type = msg.document?.mime_type;
          } else if (isGithub) {
            item.type = 'github';
            item.source_url = text.trim();
            item.title = text.trim().split('/').slice(-2).join('/');
            item.content = text;
          } else if (isUrl) {
            item.type = 'link';
            item.source_url = text.trim();
            item.title = text.trim();
            item.content = text;
          } else {
            item.type = 'text';
            item.content = text;
            item.title = text.slice(0, 80);
          }

          const { error: itemErr } = await supabase.from('items').insert(item);
          if (itemErr) console.error('Item insert error:', itemErr);
          else totalProcessed++;
        }
      }

      const newOffset = Math.max(...updates.map((u: any) => u.update_id)) + 1;
      await supabase
        .from('telegram_bot_state')
        .update({ update_offset: newOffset, updated_at: new Date().toISOString() })
        .eq('id', 1);
      currentOffset = newOffset;
    }

    return new Response(JSON.stringify({ ok: true, processed: totalProcessed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('telegram-poll error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
