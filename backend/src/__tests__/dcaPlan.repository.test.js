import { DCAPlanRepository } from '../domain/repositories/dcaPlan.repository';
describe('DCAPlanRepository', () => {
    let repo;
    beforeAll(() => {
        repo = new DCAPlanRepository();
    });
    describe('findActivePlans', () => {
        it('should return an array', async () => {
            const plans = await repo.findActivePlans();
            expect(Array.isArray(plans)).toBe(true);
        });
    });
    describe('findByUser', () => {
        it('should return an array for valid address', async () => {
            const address = '0x1234567890123456789012345678901234567890';
            const plans = await repo.findByUser(address);
            expect(Array.isArray(plans)).toBe(true);
        });
    });
});
