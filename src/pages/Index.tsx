import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Menu, MessageCircle, X, Zap, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeedItem } from "@/components/FeedItem";
import { ItemDetail } from "@/components/ItemDetail";
import { GroupManager } from "@/components/GroupManager";
import { AIChatPanel } from "@/components/AIChatPanel";
import { useToast } from "@/hooks/use-toast";
import {
  fetchItems, fetchGroups, fetchTags, fetchItemTags, fetchItemGroups,
  createGroup, deleteGroup, createTag, deleteTag, deleteItem,
  assignGroupToItem, removeGroupFromItem, assignTagToItem, removeTagFromItem,
  type Item, type Tag,
} from "@/lib/supabase-helpers";

const CONVERSATION_ID = "00000000-0000-0000-0000-000000000001";

export default function Index() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [itemGroupIds, setItemGroupIds] = useState<string[]>([]);
  const [itemTagIds, setItemTagIds] = useState<string[]>([]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items", debouncedSearch, selectedGroupId],
    queryFn: () => fetchItems(debouncedSearch || undefined, selectedGroupId || undefined),
  });

  const { data: groups = [] } = useQuery({ queryKey: ["groups"], queryFn: fetchGroups });
  const { data: tags = [] } = useQuery({ queryKey: ["tags"], queryFn: fetchTags });

  // Fetch item groups/tags when detail opens
  useEffect(() => {
    if (selectedItem) {
      fetchItemGroups(selectedItem.id).then(setItemGroupIds);
      fetchItemTags(selectedItem.id).then(setItemTagIds);
    }
  }, [selectedItem?.id]);

  // Get tags for each item (batch)
  const [itemTagsMap, setItemTagsMap] = useState<Record<string, Tag[]>>({});
  useEffect(() => {
    if (items.length === 0 || tags.length === 0) return;
    const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));
    Promise.all(items.map(async (item) => {
      const tagIds = await fetchItemTags(item.id);
      return [item.id, tagIds.map((id: string) => tagMap[id]).filter(Boolean)] as [string, Tag[]];
    })).then((entries) => setItemTagsMap(Object.fromEntries(entries)));
  }, [items, tags]);

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["items"] }); toast({ title: "Item deleted" }); },
  });

  const handleToggleGroup = async (groupId: string) => {
    if (!selectedItem) return;
    if (itemGroupIds.includes(groupId)) {
      await removeGroupFromItem(selectedItem.id, groupId);
      setItemGroupIds((prev) => prev.filter((id) => id !== groupId));
    } else {
      await assignGroupToItem(selectedItem.id, groupId);
      setItemGroupIds((prev) => [...prev, groupId]);
    }
  };

  const handleToggleTag = async (tagId: string) => {
    if (!selectedItem) return;
    if (itemTagIds.includes(tagId)) {
      await removeTagFromItem(selectedItem.id, tagId);
      setItemTagIds((prev) => prev.filter((id) => id !== tagId));
    } else {
      await assignTagToItem(selectedItem.id, tagId);
      setItemTagIds((prev) => [...prev, tagId]);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 z-40 lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 p-4 overflow-y-auto lg:relative lg:z-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Funnel</h2>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 lg:hidden" onClick={() => setShowSidebar(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <GroupManager
                groups={groups}
                tags={tags}
                selectedGroupId={selectedGroupId}
                onSelectGroup={(id) => { setSelectedGroupId(id); setShowSidebar(false); }}
                onCreateGroup={async (name, color) => { await createGroup(name, color); qc.invalidateQueries({ queryKey: ["groups"] }); }}
                onDeleteGroup={async (id) => { await deleteGroup(id); qc.invalidateQueries({ queryKey: ["groups"] }); if (selectedGroupId === id) setSelectedGroupId(null); }}
                onCreateTag={async (name, color) => { await createTag(name, color); qc.invalidateQueries({ queryKey: ["tags"] }); }}
                onDeleteTag={async (id) => { await deleteTag(id); qc.invalidateQueries({ queryKey: ["tags"] }); }}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 bg-card border-r border-border p-4 overflow-y-auto flex-shrink-0">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Funnel</h2>
        </div>
        <GroupManager
          groups={groups}
          tags={tags}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
          onCreateGroup={async (name, color) => { await createGroup(name, color); qc.invalidateQueries({ queryKey: ["groups"] }); }}
          onDeleteGroup={async (id) => { await deleteGroup(id); qc.invalidateQueries({ queryKey: ["groups"] }); if (selectedGroupId === id) setSelectedGroupId(null); }}
          onCreateTag={async (name, color) => { await createTag(name, color); qc.invalidateQueries({ queryKey: ["tags"] }); }}
          onDeleteTag={async (id) => { await deleteTag(id); qc.invalidateQueries({ queryKey: ["tags"] }); }}
        />
      </aside>

      {/* Main feed */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-2 p-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={() => setShowSidebar(true)}>
            <Menu className="h-4 w-4" />
          </Button>

          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items, keywords, content…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-background/50"
            />
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => qc.invalidateQueries({ queryKey: ["items"] })}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant={showChat ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </header>

        <div className="flex flex-1 min-h-0">
          {/* Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="h-5 w-5 text-primary animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Zap className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No items yet.</p>
                <p className="text-xs mt-1">Send something to your Telegram bot to get started.</p>
              </div>
            ) : (
              items.map((item) => (
                <FeedItem
                  key={item.id}
                  item={item}
                  tags={itemTagsMap[item.id] || []}
                  onClick={() => setSelectedItem(item)}
                  onDelete={() => deleteMutation.mutate(item.id)}
                />
              ))
            )}
          </div>

          {/* Chat panel */}
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="border-l border-border bg-card overflow-hidden hidden md:block flex-shrink-0"
              >
                <AIChatPanel conversationId={CONVERSATION_ID} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile chat overlay */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 bg-card md:hidden"
            >
              <div className="flex items-center justify-between p-3 border-b border-border">
                <span className="text-sm font-medium">AI Chat</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowChat(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="h-[calc(100vh-52px)]">
                <AIChatPanel conversationId={CONVERSATION_ID} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Item detail */}
      <ItemDetail
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        groups={groups}
        tags={tags}
        itemGroupIds={itemGroupIds}
        itemTagIds={itemTagIds}
        onToggleGroup={handleToggleGroup}
        onToggleTag={handleToggleTag}
      />
    </div>
  );
}
