import { Request, Response } from "express";

import deleteAll from "../repositories/testsRepository.js";

export default async function eraseDb(req: Request, res: Response) {
    await deleteAll();
    return res.sendStatus(200);
}