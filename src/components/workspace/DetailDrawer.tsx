import type { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export type DetailField = { label: string; values: string[] };

export function DetailDrawer({
  open,
  onOpenChange,
  kind,
  title,
  subtitle,
  fields,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: string;
  title: string;
  subtitle?: string | undefined;
  fields: DetailField[];
  footer?: ReactNode | undefined;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <Badge variant="secondary" className="w-fit font-mono text-[10px] uppercase">
            {kind}
          </Badge>
          <SheetTitle className="text-left leading-snug">{title}</SheetTitle>
          {subtitle ? (
            <SheetDescription className="text-left">{subtitle}</SheetDescription>
          ) : null}
        </SheetHeader>

        <div className="space-y-5 px-4 pb-6">
          {fields.map((field) => (
            <div key={field.label}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {field.label}
              </h4>
              {field.values.length ? (
                <ul className="mt-1.5 space-y-1">
                  {field.values.map((value, i) => (
                    <li key={`${value}-${i}`} className="text-sm leading-relaxed">
                      {value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 text-sm text-muted-foreground">Not linked yet.</p>
              )}
            </div>
          ))}
          {footer}
        </div>
      </SheetContent>
    </Sheet>
  );
}
