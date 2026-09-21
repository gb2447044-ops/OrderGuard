# OrderGuard

Business validation for e-commerce orders.

OrderGuard helps e-commerce applications detect invalid or inconsistent order data before it reaches a database, ERP, accounting system, fulfillment workflow, or other business system.

## Why OrderGuard?

Standard schema validators can check whether a field has the correct type or format.

OrderGuard focuses on **business-level order integrity**.

For example, it can detect when:

* An order has no items
* An item has an invalid quantity
* An item has a negative price
* The subtotal does not match the order items
* A discount is invalid
* Tax or shipping is negative
* The final total does not match the order calculation
* The customer email is invalid
* The order status is unsupported

## Installation

```bash
npm install orderguard
```

## Basic Usage

```ts
import { validateOrder } from "orderguard";

const order = {
  id: "ORD-1001",
  customer: {
    name: "John Doe",
    email: "john@example.com",
  },
  currency: "USD",
  status: "paid",
  items: [
    {
      name: "Wireless Mouse",
      quantity: 2,
      unitPrice: 25,
    },
  ],
  subtotal: 50,
  discount: 5,
  tax: 4.5,
  shipping: 5,
  total: 54.5,
};

const result = validateOrder(order);

if (result.valid) {
  console.log("Order is valid");
} else {
  console.log(result.errors);
}
```

## Validation Result

A valid order returns:

```ts
{
  valid: true,
  errors: []
}
```

An invalid order returns structured validation errors:

```ts
{
  valid: false,
  errors: [
    {
      code: "INVALID_SUBTOTAL",
      message: "Subtotal does not match the sum of order items. Expected 50.00, received 40.00.",
      field: "subtotal"
    }
  ]
}
```

Each error contains:

* `code` — machine-readable error code
* `message` — human-readable explanation
* `field` — the related order field when available

## Current Validation Rules

### Order

* Order ID is required
* Customer name is required
* Customer email must have a valid email format
* Currency must use a 3-letter code
* Order status must be supported
* At least one order item is required

### Items

* Item name is required
* Quantity must be a positive integer
* Unit price must be a non-negative number
* Subtotal must match the sum of item quantities × unit prices

### Financial Fields

* Discount cannot be negative
* Discount cannot exceed subtotal
* Tax cannot be negative
* Shipping cannot be negative
* Total must be non-negative
* Total must match:

```text
subtotal - discount + tax + shipping
```

## Supported Order Statuses

```text
pending
paid
processing
shipped
completed
cancelled
refunded
```

## TypeScript Support

OrderGuard is written in TypeScript and provides TypeScript declarations for its public API.

The main exported types include:

```ts
Order
OrderItem
Customer
OrderStatus
ValidationError
ValidationErrorCode
ValidationResult
```

## API

### `validateOrder(order)`

Validates an e-commerce order and returns a `ValidationResult`.

```ts
const result = validateOrder(order);
```

### `ValidationResult`

```ts
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
```

### `ValidationError`

```ts
interface ValidationError {
  code: ValidationErrorCode;
  message: string;
  field?: string;
}
```

## Use Cases

OrderGuard can be used before:

* Saving orders to a database
* Sending orders to an ERP
* Processing payments
* Starting fulfillment
* Generating invoices
* Synchronizing orders between systems
* Importing orders from external platforms
* Running internal order-processing workflows

## Example Scenario

An e-commerce application receives an order containing:

```text
2 × Wireless Mouse × $25
```

The correct subtotal is:

```text
2 × $25 = $50
```

If the application receives a subtotal of `$40`, OrderGuard detects the inconsistency before the order continues through the business workflow.

This allows the application to handle the invalid order instead of silently accepting inconsistent financial data.

## Project Status

OrderGuard is currently an early-stage library focused on practical e-commerce order validation.

The current version is:

```text
0.1.0
```

The API may evolve as additional business validation rules are introduced.

## License

MIT
