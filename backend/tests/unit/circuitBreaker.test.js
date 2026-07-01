const { CircuitBreaker, STATES } = require('../../utils/circuitBreaker');

describe('CircuitBreaker', () => {
  let breaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      timeout: 1000,
      name: 'test',
    });
  });

  it('should start in CLOSED state', () => {
    expect(breaker.getState()).toBe(STATES.CLOSED);
  });

  it('should execute function successfully when CLOSED', async () => {
    const result = await breaker.execute(async () => 'success');
    expect(result).toBe('success');
    expect(breaker.getState()).toBe(STATES.CLOSED);
  });

  it('should open circuit after failure threshold', async () => {
    const failingFn = async () => {
      throw new Error('Service down');
    };

    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow('Service down');
    }

    expect(breaker.getState()).toBe(STATES.OPEN);
  });

  it('should reject calls when circuit is OPEN', async () => {
    const failingFn = async () => {
      throw new Error('fail');
    };

    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow();
    }

    await expect(breaker.execute(async () => 'ok')).rejects.toThrow(
      'Service temporarily unavailable'
    );
  });

  it('should use fallback when circuit is OPEN', async () => {
    const failingFn = async () => {
      throw new Error('fail');
    };

    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow();
    }

    const result = await breaker.execute(failingFn, () => 'fallback data');
    expect(result).toBe('fallback data');
  });

  it('should reset circuit manually', async () => {
    const failingFn = async () => {
      throw new Error('fail');
    };

    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingFn)).rejects.toThrow();
    }

    breaker.reset();
    expect(breaker.getState()).toBe(STATES.CLOSED);

    const result = await breaker.execute(async () => 'recovered');
    expect(result).toBe('recovered');
  });
});
