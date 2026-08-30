import { JobStatus, UserRole } from './types';

export const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  pending: ['scheduled'],
  scheduled: ['en_route'],
  en_route: ['in_progress'],
  in_progress: ['completed'],
  completed: ['billed'],
  billed: [],
};

export interface StateMetadata {
  label: string;
  badgeClass: string;
  dotColor: string;
  description: string;
  allowedRoles: UserRole[];
  actionLabel?: string;
}

export const STATE_METADATA: Record<JobStatus, StateMetadata> = {
  pending: {
    label: 'Pending Assignment',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
    description: 'Booking created and deposit received. Awaiting dispatcher technician assignment.',
    allowedRoles: ['admin'],
    actionLabel: 'Assign Staff',
  },
  scheduled: {
    label: 'Scheduled',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
    description: 'Technician assigned and arrival window locked in the dispatch pipeline.',
    allowedRoles: ['technician', 'admin'],
    actionLabel: 'Start Trip (En Route)',
  },
  en_route: {
    label: 'En Route',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotColor: 'bg-purple-500',
    description: 'Technician is traveling to client location. Client arrival alert triggered.',
    allowedRoles: ['technician', 'admin'],
    actionLabel: 'Arrived & Start Work',
  },
  in_progress: {
    label: 'In Progress',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
    description: 'Technician on site. Active job timer running.',
    allowedRoles: ['technician', 'admin'],
    actionLabel: 'Complete & Collect Signature',
  },
  completed: {
    label: 'Completed',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    dotColor: 'bg-teal-500',
    description: 'Service completed and client digital sign-off recorded.',
    allowedRoles: ['admin', 'technician'],
    actionLabel: 'Generate Final Bill',
  },
  billed: {
    label: 'Billed & Settled',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotColor: 'bg-slate-600',
    description: 'Final invoice generated and remaining balance marked paid.',
    allowedRoles: ['admin'],
  },
};

/**
 * Validates whether a status transition is permitted according to finite state machine rules.
 */
export function validateTransition(
  currentStatus: JobStatus,
  targetStatus: JobStatus,
  actorRole?: UserRole
): { valid: boolean; error?: string } {
  // If no change
  if (currentStatus === targetStatus) {
    return { valid: true };
  }

  const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(targetStatus)) {
    return {
      valid: false,
      error: `Illegal state transition: Cannot move directly from '${currentStatus}' to '${targetStatus}'. Allowed next state is [${allowedNext.join(', ') || 'none'}].`,
    };
  }

  // Check role authorization if provided
  if (actorRole) {
    const targetMeta = STATE_METADATA[currentStatus];
    if (targetMeta && !targetMeta.allowedRoles.includes(actorRole) && actorRole !== 'admin') {
      return {
        valid: false,
        error: `Role '${actorRole}' is not authorized to transition job from '${currentStatus}' to '${targetStatus}'.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Returns next permissible state in linear lifecycle, or null if terminal.
 */
export function getNextSequentialState(current: JobStatus): JobStatus | null {
  const next = VALID_TRANSITIONS[current];
  return next && next.length > 0 ? next[0] : null;
}
