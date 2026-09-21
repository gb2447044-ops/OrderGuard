import type { Order } from "./types.js";
import type { ValidationOptions } from "./rules.js";
export type ValidationErrorCode = "INVALID_ORDER_ID" | "INVALID_CUSTOMER_NAME" | "INVALID_EMAIL" | "INVALID_CURRENCY" | "INVALID_STATUS" | "EMPTY_ITEMS" | "INVALID_ITEM_NAME" | "INVALID_QUANTITY" | "INVALID_UNIT_PRICE" | "INVALID_SUBTOTAL" | "INVALID_DISCOUNT" | "INVALID_TAX" | "INVALID_SHIPPING" | "INVALID_TOTAL" | "TOTAL_MISMATCH";
export interface ValidationError {
    code: ValidationErrorCode | string;
    message: string;
    field?: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}
export declare function validateOrder(order: Order, options?: ValidationOptions): ValidationResult;
//# sourceMappingURL=validator.d.ts.map