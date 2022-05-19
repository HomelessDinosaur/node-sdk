"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedule = exports.RateWorkerOptions = void 0;
const tslib_1 = require("tslib");
// Copyright 2021, Nitric Technologies Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const faas_1 = require("../faas");
const FREQUENCIES = ["days", "hours", "minutes"];
class RateWorkerOptions {
    constructor(description, rate, freq) {
        this.description = description;
        this.rate = rate;
        this.frequency = freq;
    }
}
exports.RateWorkerOptions = RateWorkerOptions;
/**
 * Provides a rate based schedule
 *
 * Rates provide a simple expressive way to define schedules
 */
class Rate {
    constructor(schedule, rate, ...mw) {
        const [_, frequency] = rate.split(" ");
        const normalizedFrequency = frequency.toLocaleLowerCase();
        // This will automatically parse the int off of a valid rate expression e.g. "10 minutes" === 10
        const rateNum = parseInt(rate);
        if (isNaN(rateNum)) {
            throw new Error("invalid rate expression, expression must begin with a number");
        }
        if (!FREQUENCIES.includes(normalizedFrequency)) {
            throw new Error(`invalid rate expression, frequency must be one of ${FREQUENCIES}, received ${frequency}`);
        }
        this.schedule = schedule;
        this.faas = new faas_1.Faas(new RateWorkerOptions(schedule['description'], rateNum, normalizedFrequency));
        this.faas.event(...mw);
    }
    start() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.faas.start();
        });
    }
}
/**
 * Providers a scheduled worker.
 */
class Schedule {
    constructor(description) {
        /**
         * Run this schedule on the provided frequency.
         *
         * @param rate to run the schedule, e.g. '7 days'. All rates accept a number and a frequency. Valid frequencies are 'days', 'hours' or 'minutes'.
         * @param mw the handler/middleware to run on a schedule
         * @returns {Promise} that resolves when the schedule worker stops running.
         */
        this.every = (rate, ...mw) => {
            // handle singular frequencies. e.g. schedule('something').every('day')
            if (FREQUENCIES.indexOf(`${rate}s`) !== -1) {
                rate = `1 ${rate}s`; // 'day' becomes '1 days'
            }
            const r = new Rate(this, rate, ...mw);
            // Start the new rate immediately
            return r['start']();
        };
        this.description = description;
    }
}
/**
 * Provides a new schedule, which can be configured with a rate/cron and a callback to run on the schedule.
 *
 * @param description of the schedule, e.g. "Nightly"
 * @returns
 */
exports.schedule = (description) => {
    return new Schedule(description);
};
