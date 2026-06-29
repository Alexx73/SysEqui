import authMiddleware from "./authMiddleware.js";
import docsMiddleware from "./docsMiddleware.js";
import timeCalcMiddleware from "./timeCalcMiddleware.js";
import endpointLogs from "./endpointLogs.js";

const middlewares = {
  authMiddleware,
  docsMiddleware,
  timeCalcMiddleware,
  endpointLogs,
};

export default middlewares;
