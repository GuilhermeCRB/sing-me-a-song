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
        
        const recommendation = recommendationFactory.createRecommendation(0);
        const recommendationWithID = {...recommendation, id: aleatoryId};

        await recommendationService.upvote(aleatoryId);

        expect(recommendationRepository.updateScore).toBeCalled();
    });
});