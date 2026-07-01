/**
 * PROJECT 4: Third-Party API Integration
 * Circuit breaker pattern for OpenWeatherMap API resilience.
 */
const STATES = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
};

class CircuitBreaker {
  constructor({
    failureThreshold = 5,
    timeout = 60000,
    name = 'default',
  } = {}) {
    this.failureThreshold = failureThreshold;
    this.timeout = timeout;
    this.name = name;
    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.nextAttempt = Date.now();
  }

  log(message) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Project 4 CircuitBreaker:${this.name}] ${message}`);
    }
  }

  async execute(fn, fallback = null) {
    if (this.state === STATES.OPEN) {
      if (Date.now() < this.nextAttempt) {
        this.log(`Circuit OPEN — rejecting call, retry after ${new Date(this.nextAttempt).toISOString()}`);
        if (fallback) return fallback();
        throw new Error('Service temporarily unavailable. Circuit breaker is OPEN.');
      }
      this.state = STATES.HALF_OPEN;
      this.log('Circuit transitioned to HALF_OPEN — testing service');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state !== STATES.CLOSED) {
      this.log('Circuit transitioned to CLOSED — service recovered');
    }
    this.state = STATES.CLOSED;
  }

  onFailure() {
    this.failureCount += 1;
    this.log(`Failure recorded (${this.failureCount}/${this.failureThreshold})`);

    if (this.failureCount >= this.failureThreshold) {
      this.state = STATES.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
      this.log(`Circuit transitioned to OPEN — will retry at ${new Date(this.nextAttempt).toISOString()}`);
    }
  }

  reset() {
    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.nextAttempt = Date.now();
    this.log('Circuit manually reset to CLOSED');
  }

  getState() {
    return this.state;
  }
}

const weatherCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  timeout: 60000,
  name: 'openweathermap',
});

module.exports = { CircuitBreaker, STATES, weatherCircuitBreaker };
