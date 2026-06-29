const docsMiddleware = (req, res, next) => {
  if (req.path.startsWith("/api-docs") && process.env.NODE_ENV === "production") {
    return res.status(404).send("Not found");
  }
  return next();
};

export default docsMiddleware;
