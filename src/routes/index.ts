import { Router } from "express";
import areasRouter from "./areasRouter.ts";
import categoriesRouter from "./categoriesRouter.ts";
import ingredientsRouter from "./ingredientsRouter.ts";
import recipesRouter from "./recipesRouter.ts";
import testimonialsRouter from "./testimonialsRouter.ts";
import usersRouter from "./usersRouter.ts";

const apiRouter = Router();

// Точки підключення модульних роутерів команди (відповідно до тікетів Trello):
// [BE-03] apiRouter.use('/auth', authRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/areas", areasRouter);
apiRouter.use("/ingredients", ingredientsRouter);
// [BE-10] apiRouter.use('/users', usersRouter);
apiRouter.use("/users", usersRouter);

apiRouter.use("/recipes", recipesRouter);

apiRouter.use("/testimonials", testimonialsRouter);

export default apiRouter;
