/// <reference types="cypress" />

import { faker } from "@faker-js/faker";

beforeEach(() => {
    cy.deleteRecommendations();
});


describe("Recommendation tests:", () => {
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

    it("Likes a recommendation.", async () => {
        const recommendation = {
            name: faker.unique(faker.animal.fish),
            youtubeLink: `https://www.youtube.com/watch?${faker.animal.fish()}`
        };

        cy.visit(BASE_FRONT_URL);

        cy.get("#name").type(recommendation.name);
        cy.get("#link").type(recommendation.youtubeLink);

        cy.get("#send-button").click();

        cy.get("#upvote").click();
        cy.get("#score").should("contain.text", "1");
    });

    it("Dislikes a recommendation.", async () => {
        const recommendation = {
            name: faker.unique(faker.animal.fish),
            youtubeLink: `https://www.youtube.com/watch?${faker.animal.fish()}`
        };

        cy.visit(BASE_FRONT_URL);

        cy.get("#name").type(recommendation.name);
        cy.get("#link").type(recommendation.youtubeLink);

        cy.get("#send-button").click();

        cy.get("#downvote").click();
        cy.get("#score").should("contain.text", "-1");
    });

    it("Navigates to top page and back to home page.", async () => {
        const recommendation1 = {
            name: faker.unique(faker.animal.fish),
            youtubeLink: `https://www.youtube.com/watch?${faker.animal.fish()}`
        };

        const recommendation2 = {
            name: faker.unique(faker.animal.fish),
            youtubeLink: `https://www.youtube.com/watch?${faker.animal.fish()}`
        };

        const recommendation3 = {
            name: faker.unique(faker.animal.fish),
            youtubeLink: `https://www.youtube.com/watch?${faker.animal.fish()}`
        };

        cy.visit(BASE_FRONT_URL);

        cy.get("#name").type(recommendation1.name);
        cy.get("#link").type(recommendation1.youtubeLink);

        cy.get("#send-button").click();


        cy.get("#name").type(recommendation2.name);
        cy.get("#link").type(recommendation2.youtubeLink);

        cy.get("#send-button").click();

        cy.get("#name").type(recommendation3.name);
        cy.get("#link").type(recommendation3.youtubeLink);

        cy.get("#send-button").click();
        
        cy.get("article:first #upvote").click();
        cy.get("article").eq(1).get("#downvote").click();

        cy.get("#top").click();
        cy.url().should("equal", `${BASE_FRONT_URL}/top`);

        cy.get("article").eq(0).get("#score").should("contain.text", "1");
        cy.get("article").eq(1).get("#score").should("contain.text", "0");
        cy.get("article").eq(2).get("#score").should("contain.text", "-1");

        cy.get("#home").click();
        cy.url().should("equal", BASE_FRONT_URL);
    });
});