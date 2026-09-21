import type { Order } from "./types.js";
export interface CustomRule {
    code: string;
    message: string;
    field?: string;
    validate: (order: Order) => boolean;
}
export interface ValidationOptions {
    rules?: CustomRule[];
}
//# sourceMappingURL=rules.d.ts.map