import dotenv from "dotenv";
import supertest from "supertest";

import app from "../src/app";
import recommendationFactory from "./factories/recommendationFactory.js";

dotenv.config();

describe("Recommendation tests:", () => {
    it("Given a name and a youtube link, create a recommendation.", async () => {
        const recommendation = recommendationFactory.createRecommendation();
        const response = await supertest(app).post("/recommendations").send(recommendation);
        expect(response.statusCode).toBe(201);
    });
});