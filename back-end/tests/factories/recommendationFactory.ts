import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";

import { prisma } from "../../src/database.js";
import { notFoundError } from "../../src/utils/errorUtils.js";
import { recommendationService } from "../../src/services/recommendationsService.js";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";

function createRecommendation(score?: number) {
    if (score) {
        return {
            name: faker.unique(faker.animal.fish),
            youtubeLink: `https://www.youtube.com/watch?${faker.animal.fish()}`,
            score
        };
    }

    return {
        name: faker.unique(faker.animal.fish),
        youtubeLink: `https://www.youtube.com/watch?${faker.animal.fish()}`,
    };
}

async function createAndPersistRecommendation(score?: number) {
    const recommendation = createRecommendation(score);
    await prisma.recommendation.create({
        data: recommendation
    });
}

async function findRecommendation() {
    return await prisma.recommendation.findFirst();
}

async function findRandomRecommendation() {
    const recommendationsArray = await prisma.recommendation.findMany();
    recommendationsArray.sort(comparator);
    return recommendationsArray[0];
}

function comparator() {
    return Math.random() - 0.5;
}

async function likeRecommendation(id: number, times: number) {
    return await prisma.recommendation.update({
        data: { score: times },
        where: { id }
    });
}

async function mockGetRandom(scoreFilter: any) {
    return jest.spyOn(recommendationService, "getRandom").mockImplementation(async () => {

        const recommendations = await getByScore(scoreFilter);
        console.log(recommendations)
        if (recommendations.length === 0) {
            throw notFoundError();
        }

        const randomIndex = Math.floor(Math.random() * recommendations.length);
        return recommendations[randomIndex];

        async function getByScore(scoreFilter: "gt" | "lte") {
            const recommendations = await recommendationRepository.findAll({
                score: 10,
                scoreFilter,
            });

            if (recommendations.length > 0) {
                return recommendations;
            }

            return recommendationRepository.findAll();
        }
    });
}

const recommendationFactory = {
    createRecommendation,
    createAndPersistRecommendation,
    findRecommendation,
    findRandomRecommendation,
    likeRecommendation,
    mockGetRandom
};

export default recommendationFactory;