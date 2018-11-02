import { exactConvertToCents } from "../money";

const fixtures: ReadonlyArray<ReadonlyArray<number>> = [
  [0, 0],
  [1, 100],
  [12.3, 1230],
  [12.34, 1234],
  [12.345, 1234],
  [12.3456, 1234],
  [150.98, 15098],
  [66.57, 6657]
];

describe("exactConvertToCents", () => {
  it("should convert amounts to cents", () => {
    fixtures.forEach(fixture => {
      const result = exactConvertToCents(fixture[0]);
      expect(result).toEqual(fixture[1]);
    });
  });
});
