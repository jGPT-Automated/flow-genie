import { useState } from "react";
import { Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Group, Tag } from "@/lib/supabase-helpers";

const COLORS = ["#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444", "#22c55e", "#ec4899", "#3b82f6", "#f97316"];

interface GroupManagerProps {
  groups: Group[];
  tags: Tag[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string | null) => void;
  onCreateGroup: (name: string, color: string) => void;
  onDeleteGroup: (id: string) => void;
  onCreateTag: (name: string, color: string) => void;
  onDeleteTag: (id: string) => void;
}

export function GroupManager({
  groups, tags, selectedGroupId, onSelectGroup,
  onCreateGroup, onDeleteGroup, onCreateTag, onDeleteTag,
}: GroupManagerProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState(COLORS[0]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(COLORS[1]);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);

  return (
    <div className="space-y-6">
      {/* Groups */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Groups</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAddGroup(!showAddGroup)}>
            {showAddGroup ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {showAddGroup && (
          <div className="glass rounded-lg p-3 mb-3 space-y-2">
            <Input
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="h-8 text-sm bg-background/50"
            />
            <div className="flex items-center gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className="h-5 w-5 rounded-full transition-transform"
                  style={{ backgroundColor: c, transform: newGroupColor === c ? "scale(1.3)" : "scale(1)", outline: newGroupColor === c ? "2px solid currentColor" : "none", outlineOffset: "2px" }}
                  onClick={() => setNewGroupColor(c)}
                />
              ))}
              <Button
                size="icon"
                className="h-6 w-6 ml-auto"
                disabled={!newGroupName.trim()}
                onClick={() => { onCreateGroup(newGroupName.trim(), newGroupColor); setNewGroupName(""); setShowAddGroup(false); }}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <button
            className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
              !selectedGroupId ? "bg-primary/10 text-primary" : "text-secondary-foreground hover:bg-secondary"
            }`}
            onClick={() => onSelectGroup(null)}
          >
            All Items
          </button>
          {groups.map((g) => (
            <div key={g.id} className="group flex items-center">
              <button
                className={`flex-1 text-left text-sm px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  selectedGroupId === g.id ? "bg-primary/10 text-primary" : "text-secondary-foreground hover:bg-secondary"
                }`}
                onClick={() => onSelectGroup(g.id)}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                {g.name}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                onClick={() => onDeleteGroup(g.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tags</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAddTag(!showAddTag)}>
            {showAddTag ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {showAddTag && (
          <div className="glass rounded-lg p-3 mb-3 space-y-2">
            <Input
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="h-8 text-sm bg-background/50"
            />
            <div className="flex items-center gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className="h-5 w-5 rounded-full transition-transform"
                  style={{ backgroundColor: c, transform: newTagColor === c ? "scale(1.3)" : "scale(1)", outline: newTagColor === c ? "2px solid currentColor" : "none", outlineOffset: "2px" }}
                  onClick={() => setNewTagColor(c)}
                />
              ))}
              <Button
                size="icon"
                className="h-6 w-6 ml-auto"
                disabled={!newTagName.trim()}
                onClick={() => { onCreateTag(newTagName.trim(), newTagColor); setNewTagName(""); setShowAddTag(false); }}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <div key={t.id} className="group relative">
              <Badge
                className="text-xs pr-5"
                style={{ backgroundColor: t.color + "20", color: t.color, borderColor: t.color + "40" }}
              >
                {t.name}
              </Badge>
              <button
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDeleteTag(t.id)}
              >
                <X className="h-3 w-3 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Need Badge import
import { Badge } from "@/components/ui/badge";
