import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Plus, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", auth.user.id)
        .maybeSingle();
      return data ?? { name: auth.user.email ?? "", email: auth.user.email ?? "" };
    },
  });

  const initials = (profile?.name || profile?.email || "?").slice(0, 2).toUpperCase();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="brand-gradient flex size-8 items-center justify-center rounded-lg">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-semibold">Project Workspace</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild size="sm">
              <Link to="/projects/new">
                <Plus className="size-4" />
                New project
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  <span className="block text-sm font-medium">{profile?.name || "Developer"}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {profile?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={signOut}>
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
    </div>
  );
}
