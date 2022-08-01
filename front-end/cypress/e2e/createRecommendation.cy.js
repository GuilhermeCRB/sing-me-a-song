/// <reference types="cypress" />

import { faker } from "@faker-js/faker";

beforeEach(() => {
    cy.deleteRecommendations();
});


describe("", () => {
    const BASE_FRONT_URL = "http://localhost:3000";
    const BASE_BACK_URL = "http://localhost:5000";

    it("Creates a recommendation.", async () => {
        const recommendation = {
            name: faker.unique(faker.animal.fish),
            youtubeLink: `https://www.youtube.com/watch?${faker.animal.fish()}`
        };

        cy.visit(BASE_FRONT_URL);

        cy.get("#name").type(recommendation.name);
        cy.get("#link").type(recommendation.youtubeLink);

        cy.intercept("POST", BASE_BACK_URL).as("postRecommendation");
        cy.get("#send-button").click();
        cy.wait("@postRecommendation");

        cy.contains(recommendation.name).should("be.visible");
    });
});