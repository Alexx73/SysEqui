import authMiddleware from "./authMiddleware.js";
import docsMiddleware from "./docsMiddleware.js";
import timeCalcMiddleware from "./timeCalcMiddleware.js";
import endpointLogs from "./endpointLogs.js";
import activityLogs from "./activityLogs.js";

const middlewares = {
  authMiddleware,
  docsMiddleware,
  timeCalcMiddleware,
  endpointLogs,
  activityLogs,
};

export default middlewares;
