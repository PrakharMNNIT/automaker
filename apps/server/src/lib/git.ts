/**
 * Shared git command execution utilities.
 *
 * This module provides the canonical `execGitCommand` helper and common
 * git utilities used across services and routes.  All consumers should
 * import from here rather than defining their own copy.
 */

import { spawnProcess } from '@automaker/platform';

// ============================================================================
// Secure Command Execution
// ============================================================================

/**
 * Execute git command with array arguments to prevent command injection.
 * Uses spawnProcess from @automaker/platform for secure, cross-platform execution.
 *
 * @param args - Array of git command arguments (e.g., ['worktree', 'add', path])
 * @param cwd - Working directory to execute the command in
 * @param env - Optional additional environment variables to pass to the git process.
 *   These are merged on top of the current process environment.  Pass
 *   `{ LC_ALL: 'C' }` to force git to emit English output regardless of the
 *   system locale so that text-based output parsing remains reliable.
 * @returns Promise resolving to stdout output
 * @throws Error with stderr/stdout message if command fails. The thrown error
 *   also has `stdout` and `stderr` string properties for structured access.
 *
 * @example
 * ```typescript
 * // Safe: no injection possible
 * await execGitCommand(['branch', '-D', branchName], projectPath);
 *
 * // Force English output for reliable text parsing:
 * await execGitCommand(['rebase', '--', 'main'], worktreePath, { LC_ALL: 'C' });
 *
 * // Instead of unsafe:
 * // await execAsync(`git branch -D ${branchName}`, { cwd });
 * ```
 */
export async function execGitCommand(
  args: string[],
  cwd: string,
  env?: Record<string, string>
): Promise<string> {
  const result = await spawnProcess({
    command: 'git',
    args,
    cwd,
    ...(env !== undefined ? { env } : {}),
  });

  // spawnProcess returns { stdout, stderr, exitCode }
  if (result.exitCode === 0) {
    return result.stdout;
  } else {
    const errorMessage =
      result.stderr || result.stdout || `Git command failed with code ${result.exitCode}`;
    throw Object.assign(new Error(errorMessage), {
      stdout: result.stdout,
      stderr: result.stderr,
    });
  }
}

// ============================================================================
// Common Git Utilities
// ============================================================================

/**
 * Get the current branch name for the given worktree.
 *
 * This is the canonical implementation shared across services.  Services
 * should import this rather than duplicating the logic locally.
 *
 * @param worktreePath - Path to the git worktree
 * @returns The current branch name (trimmed)
 */
export async function getCurrentBranch(worktreePath: string): Promise<string> {
  const branchOutput = await execGitCommand(['rev-parse', '--abbrev-ref', 'HEAD'], worktreePath);
  return branchOutput.trim();
}
