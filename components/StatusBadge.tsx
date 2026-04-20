import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status =
  | "active"
  | "inactive"
  | "on-leave"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "expired"
  | "draft"
  | "archived";

const statusConfig: Record<Status, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-success/10 text-success dark:bg-success/20 dark:text-success" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground" },
  "on-leave": { label: "On Leave", className: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary" },
  pending: { label: "Pending", className: "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning" },
  processing: { label: "Processing", className: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary" },
  shipped: { label: "Shipped", className: "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning" },
  delivered: { label: "Delivered", className: "bg-success/10 text-success dark:bg-success/20 dark:text-success" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive" },
  expired: { label: "Expired", className: "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground" },
};

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: "" };
  return (
    <Badge
      variant="secondary"
      className={cn("text-xs font-medium border-0", config.className)}
    >
      {config.label}
    </Badge>
  );
}
