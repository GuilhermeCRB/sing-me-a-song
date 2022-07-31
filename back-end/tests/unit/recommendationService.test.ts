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
});