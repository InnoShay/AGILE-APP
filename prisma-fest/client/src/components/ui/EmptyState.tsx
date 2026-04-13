import { ReactNode } from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-prisma-card flex items-center justify-center mb-6">
        {icon || <Search className="w-8 h-8 text-prisma-muted" />}
      </div>
      <h3 className="font-display text-xl tracking-wider mb-2">{title}</h3>
      <p className="text-prisma-muted font-mono text-sm max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
