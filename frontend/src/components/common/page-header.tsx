import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: React.ReactNode;
  description: string;
  icon: LucideIcon;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
}: PageHeaderProps) {
  return (
    <div className="bg-muted/50 border-b relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-5 pointer-events-none">
        <Icon size={400} />
      </div>
      <div className="container py-12 relative z-10">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
