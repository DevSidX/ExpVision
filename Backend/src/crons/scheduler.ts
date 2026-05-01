import cron from 'node-cron';
import { processRecurringTransaction } from './jobs/transaction.job';
import { processReportJob } from './jobs/report.job';

const scheduleJob = (name: string, time: string, job: Function) => {
    console.log(`Scheduling  ${name} at ${time}`);

    return cron.schedule(
        time, 
        async() => {
            try { // Executes job function
                await job();
                console.log(`${name} completed`);
            } catch (error) {
                console.log(`${name} failed`, error);
            }
        },
        {// options
            scheduled: true,
            timezone: "UTC"
        }
    )
}

// Returns an array of scheduled jobs
const startJobs = () => {
    return [
        scheduleJob('Transaction', '5 0 * * *', processRecurringTransaction) , // for 12:05 || 00:05 AM

        // run at 2:30 AM every first of the month
        scheduleJob("Reports", "*/1 * * * *", processReportJob)
    ]
}

export { 
    scheduleJob,
    startJobs
}