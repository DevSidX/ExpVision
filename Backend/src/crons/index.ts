import { startJobs } from "./scheduler"

const initilizeCrons = async () => {
    try {
        const jobs = startJobs()
        console.log(`🕰️  ${jobs.length} cron jobs initilized`);
        
        return jobs
    } catch (error) {
        console.error("CRON INIT ERROR: ",error)
        return [];
    }
}

export {
    initilizeCrons
}