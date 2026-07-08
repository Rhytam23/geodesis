import { LucideIcon } from 'lucide-react';

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon, title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="w-10 h-10 text-slate-300 mb-4" />}
      <div className="font-semibold text-lg text-slate-700">{title}</div>
      {description && <div className="text-sm text-slate-500 mt-1 max-w-xs">{description}</div>}
    </div>
  );
}
