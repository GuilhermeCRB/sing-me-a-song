import { faker } from "@faker-js/faker";

import { prisma } from "../../src/database.js";

function createRecommendation(score?: number) {
    if(score){
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

const recommendationFactory = {
    createRecommendation,
    createAndPersistRecommendation,
    findRecommendation,
    findRandomRecommendation,
    likeRecommendation
};

export default recommendationFactory;