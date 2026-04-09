import { supabase } from "@/integrations/supabase/client";

export type Item = {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  summary: string | null;
  source_url: string | null;
  raw_content: string | null;
  extracted_content: string | null;
  keywords: string[] | null;
  firecrawl_data: any;
  github_tree: any;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  processed: boolean;
  telegram_message_id: number | null;
  telegram_chat_id: number | null;
  created_at: string;
  updated_at: string;
};

export type Group = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
};

export async function fetchItems(search?: string, groupId?: string) {
  let query = supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,extracted_content.ilike.%${search}%,summary.ilike.%${search}%,keywords.cs.{${search}}`);
  }

  const { data, error } = await query;
  if (error) throw error;

  if (groupId) {
    const { data: itemGroups } = await supabase
      .from("item_groups")
      .select("item_id")
      .eq("group_id", groupId);
    const itemIds = new Set(itemGroups?.map((ig: any) => ig.item_id));
    return (data || []).filter((item: any) => itemIds.has(item.id)) as Item[];
  }

  return (data || []) as Item[];
}

export async function fetchGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data || []) as Group[];
}

export async function fetchTags() {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data || []) as Tag[];
}

export async function fetchItemTags(itemId: string) {
  const { data } = await supabase
    .from("item_tags")
    .select("tag_id")
    .eq("item_id", itemId);
  return data?.map((it: any) => it.tag_id) || [];
}

export async function fetchItemGroups(itemId: string) {
  const { data } = await supabase
    .from("item_groups")
    .select("group_id")
    .eq("item_id", itemId);
  return data?.map((ig: any) => ig.group_id) || [];
}

export async function createGroup(name: string, color: string, description?: string) {
  const { data, error } = await supabase
    .from("groups")
    .insert({ name, color, description })
    .select()
    .single();
  if (error) throw error;
  return data as Group;
}

export async function updateGroup(id: string, updates: Partial<Group>) {
  const { error } = await supabase.from("groups").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteGroup(id: string) {
  const { error } = await supabase.from("groups").delete().eq("id", id);
  if (error) throw error;
}

export async function createTag(name: string, color: string) {
  const { data, error } = await supabase
    .from("tags")
    .insert({ name, color })
    .select()
    .single();
  if (error) throw error;
  return data as Tag;
}

export async function deleteTag(id: string) {
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw error;
}

export async function assignGroupToItem(itemId: string, groupId: string) {
  await supabase.from("item_groups").upsert({ item_id: itemId, group_id: groupId });
}

export async function removeGroupFromItem(itemId: string, groupId: string) {
  await supabase.from("item_groups").delete().eq("item_id", itemId).eq("group_id", groupId);
}

export async function assignTagToItem(itemId: string, tagId: string) {
  await supabase.from("item_tags").upsert({ item_id: itemId, tag_id: tagId });
}

export async function removeTagFromItem(itemId: string, tagId: string) {
  await supabase.from("item_tags").delete().eq("item_id", itemId).eq("tag_id", tagId);
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchChatMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at");
  if (error) throw error;
  return (data || []) as ChatMessage[];
}

export async function saveChatMessage(conversationId: string, role: string, content: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ conversation_id: conversationId, role, content })
    .select()
    .single();
  if (error) throw error;
  return data as ChatMessage;
}
