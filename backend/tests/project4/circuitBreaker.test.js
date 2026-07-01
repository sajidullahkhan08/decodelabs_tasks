/**
 * Project 4: Circuit Breaker unit tests
 */
const { CircuitBreaker, STATES } = require('../../projects/project4-weather-api/utils/circuitBreaker');

describe('Project 4: Circuit Breaker', () => {
  let breaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({ failureThreshold: 3, timeout: 1000, name: 'test' });
  });

  it('should start in CLOSED state', () => {
    expect(breaker.getState()).toBe(STATES.CLOSED);
  });

  it('should open circuit after failure threshold', async () => {
    const failingFn = async () => { throw new Error('fail'); };
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow();
    }
    expect(breaker.getState()).toBe(STATES.OPEN);
  });

  it('should use fallback when circuit is OPEN', async () => {
    const failingFn = async () => { throw new Error('fail'); };
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow();
    }
    const result = await breaker.execute(failingFn, () => 'fallback');
    expect(result).toBe('fallback');
  });
});
