# OrderGuard

Business validation for e-commerce orders.

OrderGuard helps e-commerce applications detect invalid or inconsistent order data before it reaches a database, ERP system, accounting system, fulfillment workflow, or other business system.

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

Each validation error contains:

* `code` — machine-readable error code
* `message` — human-readable explanation
* `field` — related order field when available

## Current Validation Rules

### Order

* Order ID is required
* Customer name is required
* Customer email must be valid
* Currency must be a 3-letter code
* Order status must be supported
* At least one order item is required

### Order Items

* Item name is required
* Quantity must be a positive integer
* Unit price must be a non-negative number
* Subtotal must match the sum of `quantity × unitPrice` for all items

### Financial Fields

* Discount cannot be negative
* Discount cannot exceed the subtotal
* Tax cannot be negative
* Shipping cannot be negative
* Total cannot be negative
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

OrderGuard is written in TypeScript and provides type declarations for its public API.

Main exported types include:

* `Order`
* `OrderItem`
* `Customer`
* `OrderStatus`
* `ValidationError`
* `ValidationErrorCode`
* `ValidationResult`

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
* Sending orders to an ERP system
* Processing payments
* Starting fulfillment
* Generating invoices
* Synchronizing orders between systems
* Importing orders from external platforms
* Running internal order-processing workflows

## Example Scenario

An e-commerce application receives:

```text
2 x Wireless Mouse x $25
```

The correct subtotal is:

```text
2 x $25 = $50
```

If the application receives a subtotal of `$40`, OrderGuard detects the inconsistency before the order continues through the business workflow.

This allows the application to handle invalid order data instead of silently accepting inconsistent financial information.

## Project Status

OrderGuard is currently an early-stage library focused on practical business validation for e-commerce orders.

Current version:

```text
0.1.0
```

The API may evolve as additional business validation rules are introduced.

## License

MIT
