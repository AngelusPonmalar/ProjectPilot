# Project Workspace

Project Workspace turns a software idea into an editable development plan. It combines AI-assisted planning, interactive project visualisations, task tracking, and team collaboration in one workspace.

## What it does

- **Generate a development plan:** Describe a project and get a starting plan with an overview, requirements, user stories, modules, UI screens, architecture, database entities, API endpoints, implementation tasks, and SDLC phases.
- **Refine and track the plan:** Edit, add, search, filter, and remove plan items; track task and phase progress; regenerate a plan; and save named project snapshots.
- **Explore relationships visually:** Requirements traceability, user story maps, screen flows, and architecture diagrams each have **Normal View** and **List View**. Normal View supports search, zoom, pan, fit-to-screen, and detail drawers. View choices are remembered per section in the browser.
- **Work with a team:** Invite people by email, assign project roles, manage members and pending invitations, assign tasks to project members, and filter the task list to **My tasks**.
- **Protect project data:** Sign-in and project membership are enforced through the connected Lovable Cloud project and its database access policies.

## Getting started

### Requirements

- [Bun](https://bun.sh/) installed
- This project connected to Lovable Cloud, which provides authentication and the PostgreSQL database
- The project’s configured AI access for generating plans

### Run locally

```bash
bun install
bun run dev
```

Vite starts the development server and prints the local address. The app expects the Cloud connection settings to be available in the environment; the generated `.env` file is local configuration and must not be committed.

Useful scripts:

```bash
bun run lint       # Check the source code
bun run build      # Create a production build
bun run build:dev  # Build using development mode
```

## Using the app

1. Create an account or sign in with email and password or Google.
2. Choose **Create project**, then enter a project name, description, project type, and optional technology preference.
3. Review and refine the generated sections in the project workspace.
4. Use the workspace navigation to update tasks, track SDLC phases, save versions, or invite teammates.

### Team invitations

An Owner or Project Manager can invite a teammate from a project’s **Team** section and choose a role. Invitations appear in the invited person’s dashboard when they sign in with the invited email address; the app does not send an email notification. The invitee can accept or decline there. Project roles are Owner, Project Manager, Developer, Designer, and Viewer.

Project Managers and Owners can manage team invitations and membership, and assign tasks. Assigned members can update their tasks and use **My tasks** to filter the list.

## Main workspace sections

| Section | Purpose |
| --- | --- |
| Overview | Project summary, plan counts, and task progress |
| Requirements | Requirements and links to downstream work |
| User stories | Goals, epics, stories, acceptance criteria, and tasks |
| Modules | Functional parts of the system |
| UI screens | Screen purposes and navigation connections |
| Architecture | Editable components and their connections |
| Database | Suggested entities, fields, and relationships |
| API endpoints | Endpoint method, path, module, and description |
| Tasks | Task status, assignees, and personal task filtering |
| SDLC | Requirements, Design, Development, Testing, and Deployment progress |
| Versions | Saved project-plan snapshots |
| Team | Members, roles, and invitations |

## Technology

- React 19, TypeScript, and TanStack Start / TanStack Router
- Vite and Tailwind CSS
- TanStack Query for client-side data fetching and cache updates
- Lovable Cloud for authentication, PostgreSQL, and server-side functions
- React Flow (`@xyflow/react`) for interactive diagrams
- Radix UI, shadcn-style components, and Lucide icons

## Project structure

```text
src/
  components/workspace/   Project sections, visualisations, and team/task controls
  integrations/           Cloud authentication and database clients
  lib/                    Plan generation, graph building, and data queries
  routes/                 File-based application routes
    _authenticated/       Dashboard and project workspace pages
supabase/                 Local project configuration
```

## Notes

- Normal View and List View edit and display the same project data.
- Visual relationships depend on the links recorded in the project, such as requirement codes, module names, and destination screen names.
- Invitations are in-app only; teammates must register or sign in with the invited email address to see them.
