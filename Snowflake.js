class SnowflakeID {
  constructor(nodeId = 1n) {
    this.nodeId = nodeId; // Node ID (0 - 1023)
    this.sequence = 0n;   // Sequence number (0 - 4095)
    this.epoch = 1546300800000n; // Custom epoch (2019-01-01)

    this.nodeIdBits = 10n; // Number of bits for Node ID
    this.sequenceBits = 12n; // Number of bits for Sequence

    this.maxNodeId = (1n << this.nodeIdBits) - 1n;
    this.maxSequence = (1n << this.sequenceBits) - 1n;

    this.nodeIdShift = this.sequenceBits;
    this.timestampShift = this.sequenceBits + this.nodeIdBits;

    if (nodeId > this.maxNodeId) {
      throw new Error(`Node ID must be between 0 and ${this.maxNodeId}`);
    }
  }

  generate() {
    const timestamp = BigInt(Date.now()) - this.epoch;
    if (timestamp < 0n) {
      throw new Error("Timestamp must be greater than epoch.");
    }

    if (this.sequence >= this.maxSequence) {
      while (BigInt(Date.now()) - this.epoch <= timestamp) {}
      this.sequence = 0n;
    }

    const id =
      (timestamp << this.timestampShift) |
      (this.nodeId << this.nodeIdShift) |
      this.sequence;

    this.sequence++;
    return id.toString();
  }
}

// Example usage
const snowflake = new SnowflakeID(1n);
