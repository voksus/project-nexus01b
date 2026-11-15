import { Router } from "express";
import areasRouter from "./areasRouter.ts";
import authRouter from "./authRouter.ts";
import categoriesRouter from "./categoriesRouter.ts";
import ingredientsRouter from "./ingredientsRouter.ts";
import recipesRouter from "./recipesRouter.ts";
import testimonialsRouter from "./testimonialsRouter.ts";
import usersRouter from "./usersRouter.ts";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/areas", areasRouter);
apiRouter.use("/ingredients", ingredientsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/recipes", recipesRouter);
apiRouter.use("/testimonials", testimonialsRouter);

export default apiRouter;