import { Router } from "express";
import authRouter from "./authRouter.ts";
import recipesRouter from "./recipesRouter.ts";
import testimonialsRouter from "./testimonialsRouter.ts";

const apiRouter = Router();

// Точки підключення модульних роутерів команди (відповідно до тікетів Trello):
// [BE-04] apiRouter.use('/categories', categoriesRouter);
// [BE-04] apiRouter.use('/areas', areasRouter);
// [BE-04] apiRouter.use('/ingredients', ingredientsRouter);
// [BE-10] apiRouter.use('/users', usersRouter);
apiRouter.use("/auth", authRouter);

apiRouter.use("/recipes", recipesRouter);

apiRouter.use("/testimonials", testimonialsRouter);

export default apiRouter;
