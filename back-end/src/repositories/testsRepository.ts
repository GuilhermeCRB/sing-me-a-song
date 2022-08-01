import { prisma } from "../database.js";

export default async function deleteAll() {
    return prisma.recommendation.deleteMany();
}