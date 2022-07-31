import { jest } from "@jest/globals";

import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import { recommendationService } from "../../src/services/recommendationsService.js";
import recommendationFactory from "../factories/recommendationFactory";


describe("recommendationService tests:", () => {
    it("Creates a recommendation.", async () => {
        jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => {});
        jest.spyOn(recommendationRepository, "create").mockImplementationOnce((): any => {});

        const recommendation = recommendationFactory.createRecommendation();

        await recommendationService.insert(recommendation);

        expect(recommendationRepository.create).toBeCalled();
    });

    it("On create recommendation request, sends conflict error message if it already exists.", async () => {
        jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => recommendation);
        
        const recommendation = recommendationFactory.createRecommendation();

        const response = recommendationService.insert(recommendation);

        expect(response).rejects.toEqual({ type: 'conflict', message: 'Recommendations names must be unique' });
    });

    it("Likes a recommendation.", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => recommendationWithID);
        jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {});
        
        const aleatoryId = Math.floor(Math.random()*10);
        const recommendationScore = 0;
        
        const recommendation = recommendationFactory.createRecommendation(recommendationScore);
        const recommendationWithID = {...recommendation, id: aleatoryId};

        await recommendationService.upvote(aleatoryId);

        expect(recommendationRepository.updateScore).toBeCalled();
    });

    it("On create upvote request, sends not found error message if recommendation is not found.", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {});
        
        const aleatoryId = Math.floor(Math.random()*10);

        const response = recommendationService.upvote(aleatoryId);

        expect(response).rejects.toEqual({ type: 'not_found', message: "" });
    });

    it("Dislikes a recommendation.", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => recommendationWithID);
        jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {
            return {...recommendationWithID, score: recommendationWithID.score - 1};
        });
        
        const aleatoryId = Math.floor(Math.random()*10);
        const recommendationScore = 1;
        
        const recommendation = recommendationFactory.createRecommendation(recommendationScore);
        const recommendationWithID = {...recommendation, id: aleatoryId};

        await recommendationService.downvote(aleatoryId);

        expect(recommendationRepository.updateScore).toBeCalled();
    });

    it("Dislikes and deletes a recommendation if its score is lesser than -5.", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => recommendationWithID);
        jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {
            return {...recommendationWithID, score: recommendationWithID.score - 1};
        });
        jest.spyOn(recommendationRepository, "remove").mockImplementationOnce((): any => {});
        
        const aleatoryId = Math.floor(Math.random()*10);
        const recommendationScore = -5;
        
        const recommendation = recommendationFactory.createRecommendation(recommendationScore);
        const recommendationWithID = {...recommendation, id: aleatoryId};

        await recommendationService.downvote(aleatoryId);
        expect(recommendationRepository.remove).toBeCalled();
    });

    it("Gets all recommendations.", async () => {
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => {});

        await recommendationService.get();
        expect(recommendationRepository.findAll).toBeCalled();
    });

    it("Gets the top score recommendations.", async () => {
        jest.spyOn(recommendationRepository, "getAmountByScore").mockImplementationOnce((): any => {});

        const aleatoryAmount = Math.floor(Math.random()*10);

        await recommendationService.getTop(aleatoryAmount);
        expect(recommendationRepository.getAmountByScore).toBeCalled();
    });

    it("Gets a random recommendation with score greater than 10.", async () => {
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => [recommendation]);
        jest.spyOn(global.Math, "random").mockImplementation(() => 0.1);

        const recommendation = recommendationFactory.createRecommendation();
        
        const response = await recommendationService.getRandom();
        expect(response.name).toBe(recommendation.name);
    });

    it("Gets a random recommendation with score lesser or equal to 10.", async () => {
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => [recommendation]);
        jest.spyOn(global.Math, "random").mockImplementation(() => 0.8);

        const recommendation = recommendationFactory.createRecommendation();
        
        const response = await recommendationService.getRandom();
        expect(response.name).toBe(recommendation.name);
    });

    it("On get random recommendation request, sends not found error message if there is no recommendation.", async () => {
        jest.spyOn(recommendationRepository, "findAll").mockImplementation((): any => []);

        const response = recommendationService.getRandom();
        expect(response).rejects.toEqual({ type: 'not_found', message: "" });
    });
});