import dotenv from "dotenv";
import supertest from "supertest";

import app from "../src/app";
import { prisma } from "../src/database.js";
import { recommendationRepository } from "../src/repositories/recommendationRepository";
import recommendationFactory from "./factories/recommendationFactory.js";

dotenv.config();

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

describe("Recommendation tests:", () => {
    it("Given a name and a youtube link, create a recommendation.", async () => {
        const recommendation = recommendationFactory.createRecommendation();
        const response = await supertest(app).post("/recommendations").send(recommendation);
        expect(response.statusCode).toBe(201);

        const createdRecommendation = recommendationRepository.findByName(recommendation.name);
        expect(createdRecommendation).not.toBeNull();
    });

    it("sends status 409 if recommendation name was already persisted.", async () => {
        const recommendation = recommendationFactory.createRecommendation();
        await supertest(app).post("/recommendations").send(recommendation);
        const response = await supertest(app).post("/recommendations").send(recommendation);
        expect(response.statusCode).toBe(409);
    });

    it("Sends status 422 if name is not a string or youtubeLink is not a youtube link.", async () => {
        const wrongRecommendation_1 = {
            name: 1,
            youtubeLink: "https://www.youtube.com/watch?v=bcQwIxRcaYs"
        };
        
        const wrongNameResponse = await supertest(app).post("/recommendations").send(wrongRecommendation_1);
        expect(wrongNameResponse.statusCode).toBe(422);

        const wrongRecommendation_2 = {
            name: "lorem ipsum",
            youtubeLink: "https://www.google.com/"
        };
        
        const wrongLinkResponse = await supertest(app).post("/recommendations").send(wrongRecommendation_2);
        expect(wrongLinkResponse.statusCode).toBe(422);
    });
});

describe("Votes tests:", () => {
    it("Adds a like vote.", async () => {
        await recommendationFactory.createAndPersistRecommendation();
        const recommendationBefore = await recommendationFactory.findRecommendation();
        await supertest(app).post(`/recommendations/${recommendationBefore.id}/upvote`);
        const recommendationAfter = await recommendationFactory.findRecommendation();
        expect(recommendationAfter.score).toBe(recommendationBefore.score+1);
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});