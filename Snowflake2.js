class Snowflake {
  constructor(epoch = 1577836800000n, nodeId = 1n) {
    this.epoch = epoch; // Custom epoch (default is January 1, 2020)
    this.nodeId = nodeId; // Node ID (default is 1)
    this.sequence = 0n;
    this.lastTimestamp = -1n;
  }

  // Get the current timestamp in milliseconds
  currentTimestamp() {
    return BigInt(Date.now());
  }

  // Wait until the next millisecond
  waitNextMillis(lastTimestamp) {
    let timestamp = this.currentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.currentTimestamp();
    }
    return timestamp;
  }

  // Generate a new Snowflake ID
  generateId() {
    let timestamp = this.currentTimestamp();

    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards. Refusing to generate id.');
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & 4095n; // Sequence mask (12 bits)

      if (this.sequence === 0n) {
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    const id =
      ((timestamp - this.epoch) << 22n) | // Time part (41 bits)
      (this.nodeId << 12n) | // Node ID part (10 bits)
      this.sequence; // Sequence part (12 bits)

    return id.toString();
  }
}

// Usage
const snowflake = new Snowflake();
const id = snowflake.generateId();
console.log(id);
