import { WorkspaceLayout } from '../components/workspace/layout/WorkspaceLayout';

/**
 * Workspace Page
 * 
 * Primary experience for Geodesis (v1 shell).
 * Hosts the complete map-first + timeline workspace.
 * 
 * This is a UI-only static shell. No business logic, no services, no simulation.
 * All future interactive features will live inside this layout.
 */
export default function Workspace() {
  return <WorkspaceLayout />;
}
