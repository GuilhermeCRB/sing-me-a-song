import dotenv from "dotenv";
import supertest from "supertest";
import { Recommendation } from "@prisma/client";

import app from "../src/app";
import { prisma } from "../src/database.js";
import recommendationFactory from "./factories/recommendationFactory.js";
import { recommendationRepository } from "../src/repositories/recommendationRepository";

dotenv.config();

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

describe("Create recommendation tests:", () => {
    it("Given a name and a youtube link, creates a recommendation.", async () => {
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
        expect(recommendationAfter.score).toBe(recommendationBefore.score + 1);
    });

    it("Subtracts a like vote.", async () => {
        await recommendationFactory.createAndPersistRecommendation();
        const recommendationBefore = await recommendationFactory.findRecommendation();
        await supertest(app).post(`/recommendations/${recommendationBefore.id}/downvote`);
        const recommendationAfter = await recommendationFactory.findRecommendation();
        expect(recommendationAfter.score).toBe(recommendationBefore.score - 1);
    });

    it("Deletes a recommendation with a score lesser than -5.", async () => {
        const dislikeTimes = 5;

        await recommendationFactory.createAndPersistRecommendation();
        const recommendationBefore = await recommendationFactory.findRecommendation();

        for (let i = 1; i <= dislikeTimes; i++) {
            await supertest(app).post(`/recommendations/${recommendationBefore.id}/downvote`);
        }

        const recommendationLimit = await recommendationFactory.findRecommendation();
        expect(recommendationLimit).not.toBeNull();

        await supertest(app).post(`/recommendations/${recommendationBefore.id}/downvote`);

        const recommendationAfter = await recommendationFactory.findRecommendation();
        expect(recommendationAfter).toBeNull();
    });
});

describe("Get recommendation tests:", () => {
    it("Gets 10 recommendations.", async () => {
        const arrayLength = 10;
        const createDataTimes = 15;

        for (let i = 0; i < createDataTimes; i++) {
            await recommendationFactory.createAndPersistRecommendation();
        }

        const response = await supertest(app).get("/recommendations");
        const recommendationsArray: Recommendation[] = response.body;
        expect(recommendationsArray.length).toBe(arrayLength);
    });

    it("Gets a recommendation by its id.", async () => {
        const createDataTimes = 5;

        for (let i = 0; i < createDataTimes; i++) {
            await recommendationFactory.createAndPersistRecommendation();
        }

        const recommendation = await recommendationFactory.findRandomRecommendation();

        const response = await supertest(app).get(`/recommendations/${recommendation.id}`);
        const getRecommendation: Recommendation = response.body;
        expect(getRecommendation.name).toBe(recommendation.name);
    });

    it("Gets with 70% chance a random recommendation with score higher than 10.", async () => {
        const createDataTimes = 5;
        const likeTimes = 11;
        const requestTimes = 5;
        const getRecommendationsArray: Recommendation[] = [];

        recommendationFactory.mockGetRandom("gt");

        for (let i = 0; i < createDataTimes; i++) {
            await recommendationFactory.createAndPersistRecommendation();
        }

        const recommendation = await recommendationFactory.findRandomRecommendation();
        await recommendationFactory.likeRecommendation(recommendation.id, likeTimes);

        for (let i = 1; i <= requestTimes; i++) {
            const response = await supertest(app).get("/recommendations/random");
            const getRecommendation: Recommendation = response.body;
            getRecommendationsArray.push(getRecommendation);
        };

        let recommendationTimes = 0;
        getRecommendationsArray.forEach(recommendationFromArray => {
            if (recommendationFromArray.id === recommendation.id) recommendationTimes++;
        });

        expect(recommendationTimes).toBe(requestTimes);
    });

    it("Gets with 30% chance a random recommendation with score lesse or equal to 10.", async () => {
        const createDataTimes = 5;
        const likeTimes = 11;
        const requestTimes = 5;
        const getRecommendationsArray: Recommendation[] = [];

        recommendationFactory.mockGetRandom("lte");

        for (let i = 0; i < createDataTimes; i++) {
            await recommendationFactory.createAndPersistRecommendation();
        }

        const recommendation = await recommendationFactory.findRandomRecommendation();
        await recommendationFactory.likeRecommendation(recommendation.id, likeTimes);

        for (let i = 1; i <= requestTimes; i++) {
            const response = await supertest(app).get("/recommendations/random");
            const getRecommendation: Recommendation = response.body;
            getRecommendationsArray.push(getRecommendation);
        };

        let recommendationTimes = 0;
        getRecommendationsArray.forEach(recommendationFromArray => {
            if (recommendationFromArray.score <= likeTimes - 1) recommendationTimes++;
        });

        expect(recommendationTimes).toBe(requestTimes);
    });


    it("Gets a random recommendation if all recommendations have a score greater than 10.", async () => {
        const createDataTimes = 5;
        const requestTimes = 5;
        const getRecommendationsArray: Recommendation[] = [];

        for (let i = 0; i < createDataTimes; i++) {
            await recommendationFactory.createAndPersistRecommendation();
        }

        for (let i = 1; i <= requestTimes; i++) {
            const response = await supertest(app).get("/recommendations/random");
            const getRecommendation: Recommendation = response.body;
            getRecommendationsArray.push(getRecommendation);
        };

        const filterId = getRecommendationsArray[0].id;
        const recommendationTimes = getRecommendationsArray.filter(recommendation => recommendation.id === filterId).length;
        expect(recommendationTimes).not.toBe(requestTimes);
    });


    it("Gets a random recommendation if all recommendations have a score lesser or equal to 10.", async () => {
        const createDataTimes = 5;
        const requestTimes = 5;
        const score = 11;
        const getRecommendationsArray: Recommendation[] = [];

        for (let i = 0; i < createDataTimes; i++) {
            await recommendationFactory.createAndPersistRecommendation(score);
        }

        for (let i = 1; i <= requestTimes; i++) {
            const response = await supertest(app).get("/recommendations/random");
            const getRecommendation: Recommendation = response.body;
            getRecommendationsArray.push(getRecommendation);
        };

        const filterId = getRecommendationsArray[0].id;
        const recommendationTimes = getRecommendationsArray.filter(recommendation => recommendation.id === filterId).length;
        expect(recommendationTimes).not.toBe(requestTimes);
    });

    it("Gets a random recommendation if all recommendations have a score lesser or equal to 10.", async () => {
        const createDataTimes = 5;
        const requestTimes = 5;
        const score = 11;
        const getRecommendationsArray: Recommendation[] = [];

        for (let i = 0; i < createDataTimes; i++) {
            await recommendationFactory.createAndPersistRecommendation(score);
        }

        for (let i = 1; i <= requestTimes; i++) {
            const response = await supertest(app).get("/recommendations/random");
            const getRecommendation: Recommendation = response.body;
            getRecommendationsArray.push(getRecommendation);
        };

        const filterId = getRecommendationsArray[0].id;
        const recommendationTimes = getRecommendationsArray.filter(recommendation => recommendation.id === filterId).length;
        expect(recommendationTimes).not.toBe(requestTimes);
    });

    it("If there are no recommendations, sends status 404.", async () => {
        const response = await supertest(app).get("/recommendations/random");
        expect(response.statusCode).toBe(404);
    });

    it("Gets the list of recommendation in ascending score order.", async () => {
        const createDataTimes = 10;
        const amount = 3;

        let score = 1;
        for (let i = 0; i < createDataTimes; i++) {
            await recommendationFactory.createAndPersistRecommendation(score);
            score++;
        }

        const response = await supertest(app).get(`/recommendations/top/${amount}`);
        const recommendationsArray: Recommendation[] = response.body;

        for(let i = 0; i < amount; i++){
            expect(recommendationsArray[i].score).toBe(createDataTimes - i);
        };
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});