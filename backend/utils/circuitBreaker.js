/**
 * Circuit Breaker states for protecting external API calls.
 */
const STATES = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
};

/**
 * Circuit Breaker pattern implementation.
 * Prevents cascading failures when external services are down.
 */
class CircuitBreaker {
  /**
   * @param {object} options
   * @param {number} options.failureThreshold - Failures before opening circuit
   * @param {number} options.timeout - Ms before attempting half-open state
   * @param {string} options.name - Identifier for logging
   */
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

  /**
   * Log state transitions (suppressed in test environment).
   * @param {string} message
   */
  log(message) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[CircuitBreaker:${this.name}] ${message}`);
    }
  }

  /**
   * Execute a function through the circuit breaker.
   * @param {Function} fn - Async function to execute
   * @param {Function} fallback - Optional fallback when circuit is open
   * @returns {Promise<*>}
   */
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

  /** Reset failure count on successful call. */
  onSuccess() {
    this.failureCount = 0;
    if (this.state !== STATES.CLOSED) {
      this.log('Circuit transitioned to CLOSED — service recovered');
    }
    this.state = STATES.CLOSED;
  }

  /** Increment failures and open circuit when threshold exceeded. */
  onFailure() {
    this.failureCount += 1;
    this.log(`Failure recorded (${this.failureCount}/${this.failureThreshold})`);

    if (this.failureCount >= this.failureThreshold) {
      this.state = STATES.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
      this.log(`Circuit transitioned to OPEN — will retry at ${new Date(this.nextAttempt).toISOString()}`);
    }
  }

  /** Manually reset the circuit breaker. */
  reset() {
    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.nextAttempt = Date.now();
    this.log('Circuit manually reset to CLOSED');
  }

  /** @returns {string} Current circuit state */
  getState() {
    return this.state;
  }
}

/** Shared circuit breaker instance for OpenWeatherMap API */
const weatherCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  timeout: 60000,
  name: 'openweathermap',
});

module.exports = { CircuitBreaker, STATES, weatherCircuitBreaker };
