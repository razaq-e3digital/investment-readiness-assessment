'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const ProtectFallback = (props: { trigger: React.ReactNode }) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>{props.trigger}</TooltipTrigger>
      <TooltipContent align="center">
        <p>You do not have permission to perform this action.</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
