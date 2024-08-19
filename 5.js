import { unique } from './unique';

const random_integer = (range: number) => Math.round(Math.random() * range);
const max_align = 4096;
const epoch = Date.UTC(2023, 0, 1);

export const generateId = async (d1: D1Database, databaseId: number) => {
  while (true) {
    try {
      const now = Date.now(),
        align = random_integer(max_align);
      await d1
        .prepare('INSERT INTO Snowflake(now, align) VALUES(?1, ?2)')
        .bind(now, align)
        .run();
      const id = encodeId({ now, databaseId, align });
      return id;
    } catch (e) {
      if (unique(e)) {
        // delay 1 milliseconds and retry
        await new Promise((resolve) => setTimeout(resolve, 1));
      } else {
        throw e;
      }
    }
  }
};

export const encodeId = ({
  now,
  databaseId,
  align
}: {
  now: number;
  databaseId: number;
  align: number;
}) => {
  const idBigInt =
      (BigInt(now - epoch) << BigInt(22)) |
      (BigInt(databaseId) << BigInt(12)) |
      BigInt(align),
    id = idBigInt.toString();
  return id;
};

export const decodeId = (id: string) => {
  const idBigInt = BigInt(id),
    now = Number(idBigInt >> BigInt(22)) + epoch,
    databaseId = Number((idBigInt >> BigInt(12)) & 0x3ffn),
    align = Number(idBigInt & 0xfffn),
    date = new Date(now);
  return { now, date, databaseId, align };
};
