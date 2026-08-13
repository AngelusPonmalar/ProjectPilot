import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  Database,
  GitBranch,
  ListChecks,
  Layers,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project Workspace — Turn an Idea Into a Dev Plan" },
      {
        name: "description",
        content:
          "Describe a software idea and get AI-generated requirements, user stories, modules, architecture, database design, APIs and a task board — all in one workspace.",
      },
      { property: "og:title", content: "Project Workspace — Turn an Idea Into a Dev Plan" },
      {
        property: "og:description",
        content:
          "AI-assisted planning for developers: requirements, user stories, architecture, data model, APIs and tasks generated from a single idea.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: ListChecks,
    title: "Requirements & user stories",
    body: "A structured functional spec with priorities, codes and editable stories — generated in seconds, refined by you.",
  },
  {
    icon: Boxes,
    title: "Modules & UI screens",
    body: "The idea is decomposed into functional modules and the screens you actually need to build.",
  },
  {
    icon: Layers,
    title: "Architecture blueprint",
    body: "Layer-by-layer system design with responsibilities and technology choices explained in plain language.",
  },
  {
    icon: Database,
    title: "Database & API design",
    body: "Suggested entities, fields and relationships plus a concrete REST endpoint catalogue per module.",
  },
  {
    icon: Workflow,
    title: "SDLC tracking",
    body: "Move through Requirements, Design, Development, Testing and Deployment with live progress.",
  },
  {
    icon: GitBranch,
    title: "Plan versioning",
    body: "Snapshot the plan whenever it changes so you can see how the project evolved over time.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="brand-gradient flex size-8 items-center justify-center rounded-lg">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-semibold">Project Workspace</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth" search={{ mode: "signin", redirect: undefined }}>
                Sign in
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth" search={{ mode: "signup", redirect: undefined }}>
                Get started
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="surface-glow">
          <div className="mx-auto max-w-6xl px-5 py-24 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              AI-assisted software planning
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
              From a one-line idea to a{" "}
              <span className="brand-text">complete development plan</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Describe what you want to build. Project Workspace generates the requirements, user
              stories, modules, architecture, data model, API surface and task breakdown — then
              hands you a workspace to refine and track it all.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/auth" search={{ mode: "signup", redirect: undefined }}>
                  Start planning free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth" search={{ mode: "signin", redirect: undefined }}>
                  I already have an account
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">
            Everything a plan needs, in one place
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
            No more scattered docs. Each project gets a structured, editable workspace.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-elevated p-6 transition-shadow hover:shadow-lg">
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="text-center text-2xl font-semibold sm:text-3xl">How it works</h2>
            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                ["Describe the idea", "Name, a short description and your preferred tech stack."],
                ["Generate the plan", "AI produces the full structured spec across every section."],
                ["Refine and track", "Edit anything, tick off tasks, advance phases, save versions."],
              ].map(([title, body], i) => (
                <li key={title} className="text-center">
                  <div className="brand-gradient mx-auto flex size-11 items-center justify-center rounded-full font-display text-base font-semibold text-primary-foreground">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>Project Workspace</span>
          <span>Plan smarter. Build faster.</span>
        </div>
      </footer>
    </div>
  );
}
