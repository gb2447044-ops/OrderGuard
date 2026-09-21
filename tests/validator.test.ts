import { describe, expect, it } from "vitest";
import { validateOrder } from "../src/validator";
import { Order } from "../src/types";

const validOrder: Order = {
  id: "ORD-1001",
  customer: {
    name: "John Doe",
    email: "john@example.com",
  },
  currency: "USD",
  status: "paid",
  items: [
    {
      name: "Product A",
      quantity: 2,
      unitPrice: 25,
    },
  ],
  subtotal: 50,
  discount: 0,
  tax: 0,
  shipping: 0,
  total: 50,
};

describe("validateOrder", () => {
  it("accepts a valid order", () => {
    const result = validateOrder(validOrder);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects an order with an invalid email", () => {
    const order: Order = {
      ...validOrder,
      customer: {
        ...validOrder.customer,
        email: "invalid-email",
      },
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "INVALID_EMAIL",
      message: "Customer email is invalid.",
      field: "customer.email",
    });
  });

  it("rejects an order without items", () => {
    const order: Order = {
      ...validOrder,
      items: [],
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "EMPTY_ITEMS",
      message: "Order must contain at least one item.",
      field: "items",
    });
  });

  it("rejects an order with an incorrect subtotal", () => {
    const order: Order = {
      ...validOrder,
      subtotal: 70,
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "INVALID_SUBTOTAL",
      message:
        "Subtotal does not match the sum of order items. Expected 50.00, received 70.00.",
      field: "subtotal",
    });
  });

  it("rejects a negative discount", () => {
    const order: Order = {
      ...validOrder,
      discount: -10,
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "INVALID_DISCOUNT",
      message: "Discount cannot be negative.",
      field: "discount",
    });
  });

  it("rejects a discount greater than the subtotal", () => {
    const order: Order = {
      ...validOrder,
      discount: 60,
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "INVALID_DISCOUNT",
      message: "Discount cannot exceed subtotal.",
      field: "discount",
    });
  });

  it("rejects negative tax", () => {
    const order: Order = {
      ...validOrder,
      tax: -5,
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "INVALID_TAX",
      message: "Tax cannot be negative.",
      field: "tax",
    });
  });

  it("rejects negative shipping", () => {
    const order: Order = {
      ...validOrder,
      shipping: -10,
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "INVALID_SHIPPING",
      message: "Shipping cannot be negative.",
      field: "shipping",
    });
  });

  it("rejects an incorrect total", () => {
    const order: Order = {
      ...validOrder,
      discount: 10,
      tax: 5,
      shipping: 5,
      total: 100,
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "TOTAL_MISMATCH",
      message:
        "Total does not match the order calculation. Expected 50.00, received 100.00.",
      field: "total",
    });
  });

  it("accepts a valid order with discount, tax, and shipping", () => {
    const order: Order = {
      ...validOrder,
      discount: 10,
      tax: 5,
      shipping: 5,
      total: 50,
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects an item with an empty name", () => {
    const order: Order = {
      ...validOrder,
      items: [
        {
          ...validOrder.items[0],
          name: "",
        },
      ],
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "INVALID_ITEM_NAME",
      message: "Item name is required.",
      field: "items.0.name",
    });
  });

  it("rejects an item with a non-positive quantity", () => {
    const order: Order = {
      ...validOrder,
      items: [
        {
          ...validOrder.items[0],
          quantity: 0,
        },
      ],
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "INVALID_QUANTITY",
      message: "Item quantity must be a positive integer.",
      field: "items.0.quantity",
    });
  });

  it("rejects an item with a negative unit price", () => {
    const order: Order = {
      ...validOrder,
      items: [
        {
          ...validOrder.items[0],
          unitPrice: -10,
        },
      ],
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "INVALID_UNIT_PRICE",
      message: "Item unit price must be a non-negative number.",
      field: "items.0.unitPrice",
    });
  });

  it("rejects an invalid order status", () => {
    const order: Order = {
      ...validOrder,
      status: "invalid-status" as Order["status"],
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "INVALID_STATUS",
      message: 'Order status "invalid-status" is invalid.',
      field: "status",
    });
  });

  it("accepts all supported order statuses", () => {
    const statuses: Order["status"][] = [
      "pending",
      "paid",
      "processing",
      "shipped",
      "completed",
      "cancelled",
      "refunded",
    ];

    for (const status of statuses) {
      const order: Order = {
        ...validOrder,
        status,
      };

      const result = validateOrder(order);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });

  it("rejects a NaN total", () => {
    const order: Order = {
      ...validOrder,
      total: NaN,
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "INVALID_TOTAL",
      message: "Total must be a non-negative number.",
      field: "total",
    });
  });

  it("rejects an infinite discount", () => {
    const order: Order = {
      ...validOrder,
      discount: Infinity,
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "INVALID_DISCOUNT",
      message: "Discount cannot be negative.",
      field: "discount",
    });
  });

  it("rejects a negative total", () => {
    const order: Order = {
      ...validOrder,
      total: -1,
    };

    const result = validateOrder(order);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "INVALID_TOTAL",
      message: "Total must be a non-negative number.",
      field: "total",
    });
  });

  it("does not report TOTAL_MISMATCH when discount is invalid", () => {
    const order: Order = {
      ...validOrder,
      discount: -10,
    };

    const result = validateOrder(order);

    expect(result.errors).not.toContainEqual({
      code: "TOTAL_MISMATCH",
      message:
        "Total does not match the order calculation. Expected 60.00, received 50.00.",
      field: "total",
    });
  });
});