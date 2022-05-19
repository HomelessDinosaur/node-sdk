import { EventMiddleware } from "../faas";
declare type Frequency = "days" | "hours" | "minutes";
export declare class RateWorkerOptions {
    readonly description: string;
    readonly rate: number;
    readonly frequency: Frequency;
    constructor(description: string, rate: number, freq: Frequency);
}
/**
 * Providers a scheduled worker.
 */
declare class Schedule {
    private readonly description;
    constructor(description: string);
    /**
     * Run this schedule on the provided frequency.
     *
     * @param rate to run the schedule, e.g. '7 days'. All rates accept a number and a frequency. Valid frequencies are 'days', 'hours' or 'minutes'.
     * @param mw the handler/middleware to run on a schedule
     * @returns {Promise} that resolves when the schedule worker stops running.
     */
    every: (rate: string, ...mw: EventMiddleware[]) => Promise<void>;
}
/**
 * Provides a new schedule, which can be configured with a rate/cron and a callback to run on the schedule.
 *
 * @param description of the schedule, e.g. "Nightly"
 * @returns
 */
export declare const schedule: (description: string) => Schedule;
export {};
