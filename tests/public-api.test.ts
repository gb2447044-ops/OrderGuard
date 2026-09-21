import { describe, expect, it } from "vitest";
import {
  validateOrder,
  type Order,
  type ValidationError,
  type ValidationErrorCode,
  type ValidationResult,
} from "../src";

describe("OrderGuard public API", () => {
  it("exports validateOrder from the package entry point", () => {
    const order: Order = {
      id: "ORD-2001",
      customer: {
        name: "Jane Doe",
        email: "jane@example.com",
      },
      currency: "USD",
      status: "paid",
      items: [
        {
          name: "Product A",
          quantity: 1,
          unitPrice: 100,
        },
      ],
      subtotal: 100,
      discount: 0,
      tax: 0,
      shipping: 0,
      total: 100,
    };

    const result: ValidationResult = validateOrder(order);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns typed validation errors from the public API", () => {
    const order: Order = {
      id: "",
      customer: {
        name: "Jane Doe",
        email: "jane@example.com",
      },
      currency: "USD",
      status: "paid",
      items: [
        {
          name: "Product A",
          quantity: 1,
          unitPrice: 100,
        },
      ],
      subtotal: 100,
      discount: 0,
      tax: 0,
      shipping: 0,
      total: 100,
    };

    const result = validateOrder(order);

    const error: ValidationError | undefined = result.errors[0];
    const code: ValidationErrorCode | undefined = error?.code;

    expect(result.valid).toBe(false);
    expect(code).toBe("INVALID_ORDER_ID");
  });
});