import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PROJECT_COLORS = [
  'bg-blue-500/50 group-hover:bg-blue-500',
  'bg-emerald-500/50 group-hover:bg-emerald-500',
  'bg-violet-500/50 group-hover:bg-violet-500',
  'bg-amber-500/50 group-hover:bg-amber-500',
  'bg-rose-500/50 group-hover:bg-rose-500',
  'bg-cyan-500/50 group-hover:bg-cyan-500',
  'bg-fuchsia-500/50 group-hover:bg-fuchsia-500',
  'bg-teal-500/50 group-hover:bg-teal-500',
];

export function getProjectColorClasses(projectId: string | undefined) {
  if (!projectId) return 'bg-primary/50 group-hover:bg-primary';
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = projectId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PROJECT_COLORS.length;
  return PROJECT_COLORS[index];
}
