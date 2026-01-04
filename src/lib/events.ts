import { EventEmitter } from 'events';

// In Next.js dev mode, the global object is preserved between HMR updates.
// This prevents multiple EventEmitters from being created.
const globalForEvents = global as unknown as {
    notificationEmitter: EventEmitter | undefined;
};

export const notificationEmitter =
    globalForEvents.notificationEmitter ?? new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
    globalForEvents.notificationEmitter = notificationEmitter;
}
