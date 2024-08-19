class Snowflake {
  constructor(workerId = 1n, datacenterId = 1n, sequence = 0n) {
    this.epoch = 1546300800000n; // Custom epoch (e.g., January 1, 2019)
    this.workerId = workerId & 0x1fn; // 5 bits for workerId (0-31)
    this.datacenterId = datacenterId & 0x1fn; // 5 bits for datacenterId (0-31)
    this.sequence = sequence & 0xfffn; // 12 bits for sequence (0-4095)
    this.lastTimestamp = -1n;
  }

  // Generate the next ID
  nextId() {
    let timestamp = this.getTimestamp();

    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards. Refusing to generate id for ' + (this.lastTimestamp - timestamp) + ' milliseconds');
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & 0xfffn;
      if (this.sequence === 0n) {
        timestamp = this.waitNextMillis(timestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    return (
      ((timestamp - this.epoch) << 22n) |
      (this.datacenterId << 17n) |
      (this.workerId << 12n) |
      this.sequence
    ).toString();
  }

  // Get current timestamp in milliseconds
  getTimestamp() {
    return BigInt(Date.now());
  }

  // Wait for the next millisecond
  waitNextMillis(timestamp) {
    let currentTimestamp = this.getTimestamp();
    while (currentTimestamp <= timestamp) {
      currentTimestamp = this.getTimestamp();
    }
    return currentTimestamp;
  }
}

// Usage
const snowflake = new Snowflake(1n, 1n);
console.log(snowflake.nextId());
