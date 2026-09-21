import type { Order, OrderStatus } from "./types.js";
import type { CustomRule, ValidationOptions } from "./rules.js";

export type ValidationErrorCode =
  | "INVALID_ORDER_ID"
  | "INVALID_CUSTOMER_NAME"
  | "INVALID_EMAIL"
  | "INVALID_CURRENCY"
  | "INVALID_STATUS"
  | "EMPTY_ITEMS"
  | "INVALID_ITEM_NAME"
  | "INVALID_QUANTITY"
  | "INVALID_UNIT_PRICE"
  | "INVALID_SUBTOTAL"
  | "INVALID_DISCOUNT"
  | "INVALID_TAX"
  | "INVALID_SHIPPING"
  | "INVALID_TOTAL"
  | "TOTAL_MISMATCH";

export interface ValidationError {
  code: ValidationErrorCode | string;
  message: string;
  field?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const validStatuses: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
];

export function validateOrder(
  order: Order,
  options?: ValidationOptions,
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!order.id || order.id.trim() === "") {
    errors.push({
      code: "INVALID_ORDER_ID",
      message: "Order ID is required.",
      field: "id",
    });
  }

  if (!order.customer.name || order.customer.name.trim() === "") {
    errors.push({
      code: "INVALID_CUSTOMER_NAME",
      message: "Customer name is required.",
      field: "customer.name",
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !order.customer.email ||
    !emailPattern.test(order.customer.email.trim())
  ) {
    errors.push({
      code: "INVALID_EMAIL",
      message: "Customer email is invalid.",
      field: "customer.email",
    });
  }

  if (!order.currency || !/^[A-Za-z]{3}$/.test(order.currency.trim())) {
    errors.push({
      code: "INVALID_CURRENCY",
      message: "Currency must be a 3-letter ISO-style code.",
      field: "currency",
    });
  }

  if (!validStatuses.includes(order.status)) {
    errors.push({
      code: "INVALID_STATUS",
      message: `Order status "${order.status}" is invalid.`,
      field: "status",
    });
  }

  let hasInvalidItemValues = false;

  if (!Array.isArray(order.items) || order.items.length === 0) {
    errors.push({
      code: "EMPTY_ITEMS",
      message: "Order must contain at least one item.",
      field: "items",
    });
  } else {
    let calculatedSubtotal = 0;

    order.items.forEach((item, index) => {
      if (!item.name || item.name.trim() === "") {
        errors.push({
          code: "INVALID_ITEM_NAME",
          message: "Item name is required.",
          field: `items.${index}.name`,
        });
      }

      if (
        !Number.isFinite(item.quantity) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        errors.push({
          code: "INVALID_QUANTITY",
          message: "Item quantity must be a positive integer.",
          field: `items.${index}.quantity`,
        });

        hasInvalidItemValues = true;
      }

      if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
        errors.push({
          code: "INVALID_UNIT_PRICE",
          message: "Item unit price must be a non-negative number.",
          field: `items.${index}.unitPrice`,
        });

        hasInvalidItemValues = true;
      }

      if (
        Number.isFinite(item.quantity) &&
        Number.isFinite(item.unitPrice) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        item.unitPrice >= 0
      ) {
        calculatedSubtotal += item.quantity * item.unitPrice;
      }
    });

    if (
      !hasInvalidItemValues &&
      (!Number.isFinite(order.subtotal) ||
        Math.abs(calculatedSubtotal - order.subtotal) > 0.01)
    ) {
      errors.push({
        code: "INVALID_SUBTOTAL",
        message: `Subtotal does not match the sum of order items. Expected ${calculatedSubtotal.toFixed(2)}, received ${
          Number.isFinite(order.subtotal)
            ? order.subtotal.toFixed(2)
            : "invalid"
        }.`,
        field: "subtotal",
      });
    }
  }

  const validDiscount =
    Number.isFinite(order.discount) && order.discount >= 0;

  if (!validDiscount) {
    errors.push({
      code: "INVALID_DISCOUNT",
      message: "Discount cannot be negative.",
      field: "discount",
    });
  }

  if (
    validDiscount &&
    Number.isFinite(order.subtotal) &&
    order.discount > order.subtotal
  ) {
    errors.push({
      code: "INVALID_DISCOUNT",
      message: "Discount cannot exceed subtotal.",
      field: "discount",
    });
  }

  const validTax = Number.isFinite(order.tax) && order.tax >= 0;

  if (!validTax) {
    errors.push({
      code: "INVALID_TAX",
      message: "Tax cannot be negative.",
      field: "tax",
    });
  }

  const validShipping =
    Number.isFinite(order.shipping) && order.shipping >= 0;

  if (!validShipping) {
    errors.push({
      code: "INVALID_SHIPPING",
      message: "Shipping cannot be negative.",
      field: "shipping",
    });
  }

  const validTotal = Number.isFinite(order.total) && order.total >= 0;

  if (!validTotal) {
    errors.push({
      code: "INVALID_TOTAL",
      message: "Total must be a non-negative number.",
      field: "total",
    });
  }

  if (
    Number.isFinite(order.subtotal) &&
    validDiscount &&
    validTax &&
    validShipping &&
    validTotal
  ) {
    const expectedTotal =
      order.subtotal - order.discount + order.tax + order.shipping;

    if (Math.abs(expectedTotal - order.total) > 0.01) {
      errors.push({
        code: "TOTAL_MISMATCH",
        message: `Total does not match the order calculation. Expected ${expectedTotal.toFixed(2)}, received ${order.total.toFixed(2)}.`,
        field: "total",
      });
    }
  }

  if (options?.rules) {
    for (const rule of options.rules) {
      const passed = rule.validate(order);

      if (!passed) {
        errors.push({
          code: rule.code,
          message: rule.message,
          field: rule.field,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}