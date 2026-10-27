import { TeleSession } from '../types/telehealth';

type Status = TeleSession['status'];

/** Allowed transitions. Completed and Cancelled are terminal. */
const TRANSITIONS: Record<Status, Status[]> = {
  Upcoming: ['In Session', 'Cancelled'],
  'In Session': ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

export function canTransition(from: Status, to: Status): boolean {
  return from === to || TRANSITIONS[from].includes(to);
}

export function isSessionStatus(value: string): value is Status {
  return Object.prototype.hasOwnProperty.call(TRANSITIONS, value);
}
