import { faker } from "@faker-js/faker";

import { prisma } from "../../src/database.js";

function createRecommendation() {
    return {
        name: faker.unique(faker.animal.fish),
        youtubeLink: `https://www.youtube.com/watch?${faker.animal.fish()}`
    };
}

async function createAndPersistRecommendation() {
    const recommendation = createRecommendation();
    await prisma.recommendation.create({
        data: recommendation
    });
}

async function findRecommendation() {
    return await prisma.recommendation.findFirst();
}

const recommendationFactory = {
    createRecommendation,
    createAndPersistRecommendation,
    findRecommendation
};

export default recommendationFactory;