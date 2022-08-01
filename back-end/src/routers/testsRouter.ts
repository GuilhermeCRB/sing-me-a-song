import { Router } from "express";

import eraseDb from "../controllers/testsController.js";

const testsRouter = Router();

testsRouter.delete("/eraseDb", eraseDb);

export default testsRouter;