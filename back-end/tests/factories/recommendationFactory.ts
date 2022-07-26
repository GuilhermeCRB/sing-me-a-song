import { prisma } from "../../src/database.js";

function createRecommendation() {
    return {
        name: "lorem ipsum",
        youtubeLink: "https://www.youtube.com/watch?v=bcQwIxRcaYs"
    };
}

async function createAndPersistRecommendation(){
    const recommendation = createRecommendation();
    await prisma.recommendation.create({
        data: recommendation
    });
}

async function findRecommendation(){
    return await prisma.recommendation.findFirst();
}

const recommendationFactory = {
    createRecommendation,
    createAndPersistRecommendation,
    findRecommendation
};

export default recommendationFactory;