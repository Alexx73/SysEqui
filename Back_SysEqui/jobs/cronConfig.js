// Library
import cron from "node-cron";
// Jobs
import moveInactiveUsers from "./jobs/moveInactiveUsers.js";

const cronJobs = () => {
  // Configurar el cron job para que corra diariamente a la medianoche
  cron.schedule("0 0 * * *", async () => {
    console.log("Ejecutando cron para mover usuarios inactivos...");
    await moveInactiveUsers();
  });
};
export default cronJobs;
