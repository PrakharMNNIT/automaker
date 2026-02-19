/**
 * CheckoutBranchService - Create and checkout a new branch with stash handling
 *
 * Handles new branch creation with automatic stash/reapply of local changes.
 * If there are uncommitted changes and the caller requests stashing, they are
 * stashed before creating the branch and reapplied after. If the stash pop
 * results in merge conflicts, returns a special response so the UI can create
 * a conflict resolution task.
 *
 * Follows the same pattern as worktree-branch-service.ts (performSwitchBranch).
 *
 * The workflow:
 * 1. Validate inputs (branch name, base branch)
 * 2. Get current branch name
 * 3. Check if target branch already exists
 * 4. Optionally stash local changes
 * 5. Create and checkout the new branch
 * 6. Reapply stashed changes (detect conflicts)
 * 7. Handle error recovery (restore stash if checkout fails)
 */

import { createLogger, getErrorMessage } from '@automaker/utils';
import { execGitCommand, execGitCommandWithLockRetry } from '../lib/git.js';
import type { EventEmitter } from '../lib/events.js';

const logger = createLogger('CheckoutBranchService');

// ============================================================================
// Types
// ============================================================================

export interface CheckoutBranchOptions {
  /** When true, stash local changes before checkout and reapply after */
  stashChanges?: boolean;
  /** When true, include untracked files in the stash */
  includeUntracked?: boolean;
}

export interface CheckoutBranchResult {
  success: boolean;
  error?: string;
  result?: {
    previousBranch: string;
    newBranch: string;
    message: string;
    hasConflicts?: boolean;
    stashedChanges?: boolean;
  };
  /** Set when checkout fails and stash pop produced conflicts during recovery */
  stashPopConflicts?: boolean;
  /** Human-readable message when stash pop conflicts occur during error recovery */
  stashPopConflictMessage?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if there are any changes (including untracked) that should be stashed
 */
async function hasAnyChanges(cwd: string): Promise<boolean> {
  try {
    const stdout = await execGitCommand(['status', '--porcelain'], cwd);
    const lines = stdout
      .trim()
      .split('\n')
      .filter((line) => line.trim());
    return lines.length > 0;
  } catch (err) {
    logger.error('hasAnyChanges: execGitCommand failed — returning false', {
      cwd,
      error: getErrorMessage(err),
    });
    return false;
  }
}

/**
 * Stash all local changes (including untracked files if requested)
 * Returns true if a stash was created, false if there was nothing to stash.
 * Throws on unexpected errors so callers abort rather than proceeding silently.
 */
async function stashChanges(
  cwd: string,
  message: string,
  includeUntracked: boolean
): Promise<boolean> {
  try {
    const args = ['stash', 'push'];
    if (includeUntracked) {
      args.push('--include-untracked');
    }
    args.push('-m', message);

    await execGitCommandWithLockRetry(args, cwd);
    return true;
  } catch (error) {
    const errorMsg = getErrorMessage(error);

    // "Nothing to stash" is benign
    if (
      errorMsg.toLowerCase().includes('no local changes to save') ||
      errorMsg.toLowerCase().includes('nothing to stash')
    ) {
      logger.debug('stashChanges: nothing to stash', { cwd, message, error: errorMsg });
      return false;
    }

    logger.error('stashChanges: unexpected error during stash', {
      cwd,
      message,
      error: errorMsg,
    });
    throw new Error(`Failed to stash changes in ${cwd}: ${errorMsg}`);
  }
}

/**
 * Pop the most recent stash entry
 * Returns an object indicating success and whether there were conflicts
 */
async function popStash(
  cwd: string
): Promise<{ success: boolean; hasConflicts: boolean; error?: string }> {
  try {
    await execGitCommand(['stash', 'pop'], cwd);
    return { success: true, hasConflicts: false };
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    if (errorMsg.includes('CONFLICT') || errorMsg.includes('Merge conflict')) {
      return { success: false, hasConflicts: true, error: errorMsg };
    }
    return { success: false, hasConflicts: false, error: errorMsg };
  }
}

/**
 * Check if a local branch already exists
 */
async function localBranchExists(cwd: string, branchName: string): Promise<boolean> {
  try {
    await execGitCommand(['rev-parse', '--verify', `refs/heads/${branchName}`], cwd);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Main Service Function
// ============================================================================

/**
 * Create and checkout a new branch, optionally stashing and restoring local changes.
 *
 * @param worktreePath - Path to the git worktree
 * @param branchName - Name of the new branch to create
 * @param baseBranch - Optional base branch to create from (defaults to current HEAD)
 * @param options - Stash handling options
 * @param events - Optional event emitter for lifecycle events
 * @returns CheckoutBranchResult with detailed status information
 */
export async function performCheckoutBranch(
  worktreePath: string,
  branchName: string,
  baseBranch?: string,
  options?: CheckoutBranchOptions,
  events?: EventEmitter
): Promise<CheckoutBranchResult> {
  const shouldStash = options?.stashChanges ?? false;
  const includeUntracked = options?.includeUntracked ?? true;

  // Emit start event
  events?.emit('switch:start', { worktreePath, branchName, operation: 'checkout' });

  // 1. Get current branch
  const currentBranchOutput = await execGitCommand(
    ['rev-parse', '--abbrev-ref', 'HEAD'],
    worktreePath
  );
  const previousBranch = currentBranchOutput.trim();

  // 2. Check if branch already exists
  if (await localBranchExists(worktreePath, branchName)) {
    events?.emit('switch:error', {
      worktreePath,
      branchName,
      error: `Branch '${branchName}' already exists`,
    });
    return {
      success: false,
      error: `Branch '${branchName}' already exists`,
    };
  }

  // 3. Validate base branch if provided
  if (baseBranch) {
    try {
      await execGitCommand(['rev-parse', '--verify', baseBranch], worktreePath);
    } catch {
      events?.emit('switch:error', {
        worktreePath,
        branchName,
        error: `Base branch '${baseBranch}' does not exist`,
      });
      return {
        success: false,
        error: `Base branch '${baseBranch}' does not exist`,
      };
    }
  }

  // 4. Stash local changes if requested and there are changes
  let didStash = false;

  if (shouldStash) {
    const hadChanges = await hasAnyChanges(worktreePath);
    if (hadChanges) {
      events?.emit('switch:stash', {
        worktreePath,
        previousBranch,
        targetBranch: branchName,
        action: 'push',
      });

      const stashMessage = `Auto-stash before switching to ${branchName}`;
      try {
        didStash = await stashChanges(worktreePath, stashMessage, includeUntracked);
      } catch (stashError) {
        const stashErrorMsg = getErrorMessage(stashError);
        events?.emit('switch:error', {
          worktreePath,
          branchName,
          error: `Failed to stash local changes: ${stashErrorMsg}`,
        });
        return {
          success: false,
          error: `Failed to stash local changes before creating branch: ${stashErrorMsg}`,
        };
      }
    }
  }

  try {
    // 5. Create and checkout the new branch
    events?.emit('switch:checkout', {
      worktreePath,
      targetBranch: branchName,
      isRemote: false,
      previousBranch,
    });

    const checkoutArgs = ['checkout', '-b', branchName];
    if (baseBranch) {
      checkoutArgs.push(baseBranch);
    }
    await execGitCommand(checkoutArgs, worktreePath);

    // 6. Reapply stashed changes if we stashed earlier
    let hasConflicts = false;
    let conflictMessage = '';
    let stashReapplied = false;

    if (didStash) {
      events?.emit('switch:pop', {
        worktreePath,
        targetBranch: branchName,
        action: 'pop',
      });

      const popResult = await popStash(worktreePath);
      hasConflicts = popResult.hasConflicts;
      if (popResult.hasConflicts) {
        conflictMessage = `Created branch '${branchName}' but merge conflicts occurred when reapplying your local changes. Please resolve the conflicts.`;
      } else if (!popResult.success) {
        conflictMessage = `Created branch '${branchName}' but failed to reapply stashed changes: ${popResult.error}. Your changes are still in the stash.`;
      } else {
        stashReapplied = true;
      }
    }

    if (hasConflicts) {
      events?.emit('switch:done', {
        worktreePath,
        previousBranch,
        currentBranch: branchName,
        hasConflicts: true,
      });
      return {
        success: true,
        result: {
          previousBranch,
          newBranch: branchName,
          message: conflictMessage,
          hasConflicts: true,
          stashedChanges: true,
        },
      };
    } else if (didStash && !stashReapplied) {
      // Stash pop failed for a non-conflict reason — stash is still present
      events?.emit('switch:done', {
        worktreePath,
        previousBranch,
        currentBranch: branchName,
        stashPopFailed: true,
      });
      return {
        success: true,
        result: {
          previousBranch,
          newBranch: branchName,
          message: conflictMessage,
          hasConflicts: false,
          stashedChanges: true,
        },
      };
    } else {
      const stashNote = stashReapplied ? ' (local changes stashed and reapplied)' : '';
      events?.emit('switch:done', {
        worktreePath,
        previousBranch,
        currentBranch: branchName,
        stashReapplied,
      });
      return {
        success: true,
        result: {
          previousBranch,
          newBranch: branchName,
          message: `Created and checked out branch '${branchName}'${stashNote}`,
          hasConflicts: false,
          stashedChanges: stashReapplied,
        },
      };
    }
  } catch (checkoutError) {
    // 7. If checkout failed and we stashed, try to restore the stash
    if (didStash) {
      const popResult = await popStash(worktreePath);
      if (popResult.hasConflicts) {
        const checkoutErrorMsg = getErrorMessage(checkoutError);
        events?.emit('switch:error', {
          worktreePath,
          branchName,
          error: checkoutErrorMsg,
          stashPopConflicts: true,
        });
        return {
          success: false,
          error: checkoutErrorMsg,
          stashPopConflicts: true,
          stashPopConflictMessage:
            'Stash pop resulted in conflicts: your stashed changes were partially reapplied ' +
            'but produced merge conflicts. Please resolve the conflicts before retrying.',
        };
      } else if (!popResult.success) {
        const checkoutErrorMsg = getErrorMessage(checkoutError);
        const combinedMessage =
          `${checkoutErrorMsg}. Additionally, restoring your stashed changes failed: ` +
          `${popResult.error ?? 'unknown error'} — your changes are still saved in the stash.`;
        events?.emit('switch:error', {
          worktreePath,
          branchName,
          error: combinedMessage,
        });
        return {
          success: false,
          error: combinedMessage,
          stashPopConflicts: false,
        };
      }
      // popResult.success === true: stash was cleanly restored
    }
    const checkoutErrorMsg = getErrorMessage(checkoutError);
    events?.emit('switch:error', {
      worktreePath,
      branchName,
      error: checkoutErrorMsg,
    });
    throw checkoutError;
  }
}
