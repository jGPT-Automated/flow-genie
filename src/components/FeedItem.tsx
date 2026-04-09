import { motion } from "framer-motion";
import { Link2, FileText, Github, MessageSquare, ExternalLink, Trash2 } from "lucide-react";
import type { Item } from "@/lib/supabase-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const typeIcons: Record<string, React.ReactNode> = {
  link: <Link2 className="h-4 w-4" />,
  file: <FileText className="h-4 w-4" />,
  github: <Github className="h-4 w-4" />,
  text: <MessageSquare className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  link: "bg-primary/20 text-primary",
  file: "bg-accent/20 text-accent",
  github: "bg-success/20 text-success",
  text: "bg-warning/20 text-warning",
};

interface FeedItemProps {
  item: Item;
  onClick: () => void;
  onDelete: () => void;
  tags?: { id: string; name: string; color: string }[];
}

export function FeedItem({ item, onClick, onDelete, tags = [] }: FeedItemProps) {
  const time = new Date(item.created_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group glass rounded-lg p-4 cursor-pointer transition-all hover:border-primary/30 hover:glow-primary"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-md p-1.5 ${typeColors[item.type] || typeColors.text}`}>
          {typeIcons[item.type] || typeIcons.text}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-foreground truncate text-sm">
              {item.title || item.content?.slice(0, 60) || "Untitled"}
            </h3>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
          </div>

          {item.summary && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>
          )}

          {item.source_url && (
            <p className="text-xs text-primary/70 mt-1 truncate font-mono">{item.source_url}</p>
          )}

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border">
              {item.type}
            </Badge>
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                className="text-[10px] px-1.5 py-0 border-0"
                style={{ backgroundColor: tag.color + "30", color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
            {item.keywords?.slice(0, 3).map((kw) => (
              <Badge key={kw} variant="secondary" className="text-[10px] px-1.5 py-0">
                {kw}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.source_url && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); window.open(item.source_url!, "_blank"); }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
