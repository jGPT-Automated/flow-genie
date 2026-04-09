import { X, ExternalLink, Github, Link2, FileText, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Item, Group, Tag } from "@/lib/supabase-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface ItemDetailProps {
  item: Item | null;
  open: boolean;
  onClose: () => void;
  groups: Group[];
  tags: Tag[];
  itemGroupIds: string[];
  itemTagIds: string[];
  onToggleGroup: (groupId: string) => void;
  onToggleTag: (tagId: string) => void;
}

export function ItemDetail({
  item, open, onClose, groups, tags,
  itemGroupIds, itemTagIds, onToggleGroup, onToggleTag,
}: ItemDetailProps) {
  if (!item) return null;

  const typeIcon = {
    link: <Link2 className="h-5 w-5" />,
    file: <FileText className="h-5 w-5" />,
    github: <Github className="h-5 w-5" />,
    text: <MessageSquare className="h-5 w-5" />,
  }[item.type] || <MessageSquare className="h-5 w-5" />;

  const displayContent = item.extracted_content || item.raw_content || item.content || "";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border p-0">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="text-primary">{typeIcon}</div>
            <SheetTitle className="text-foreground text-left flex-1 truncate">
              {item.title || "Untitled"}
            </SheetTitle>
            {item.source_url && (
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a href={item.source_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-4">
            {/* Groups */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Groups</p>
              <div className="flex flex-wrap gap-1.5">
                {groups.map((g) => (
                  <Badge
                    key={g.id}
                    className="cursor-pointer text-xs transition-all"
                    style={{
                      backgroundColor: itemGroupIds.includes(g.id) ? g.color + "40" : "transparent",
                      color: g.color,
                      borderColor: g.color + "50",
                    }}
                    variant="outline"
                    onClick={() => onToggleGroup(g.id)}
                  >
                    {g.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <Badge
                    key={t.id}
                    className="cursor-pointer text-xs transition-all"
                    style={{
                      backgroundColor: itemTagIds.includes(t.id) ? t.color + "40" : "transparent",
                      color: t.color,
                      borderColor: t.color + "50",
                    }}
                    variant="outline"
                    onClick={() => onToggleTag(t.id)}
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Keywords */}
            {item.keywords && item.keywords.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.keywords.map((kw) => (
                    <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {item.summary && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">AI Summary</p>
                <div className="glass rounded-lg p-3 text-sm text-secondary-foreground">
                  {item.summary}
                </div>
              </div>
            )}

            {/* GitHub Tree */}
            {item.github_tree && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Project Structure</p>
                <pre className="glass rounded-lg p-3 text-xs font-mono text-secondary-foreground overflow-x-auto whitespace-pre">
                  {typeof item.github_tree === "string" ? item.github_tree : JSON.stringify(item.github_tree, null, 2)}
                </pre>
              </div>
            )}

            {/* Content */}
            {displayContent && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Content</p>
                <div className="glass rounded-lg p-4 prose prose-sm prose-invert max-w-none text-secondary-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground pt-2">
              {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
