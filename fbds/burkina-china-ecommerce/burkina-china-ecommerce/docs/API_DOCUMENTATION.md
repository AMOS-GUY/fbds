# BurkinaChina Connect API Documentation

## Base URL

## Endpoints

### 🔐 Authentication

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| POST   | `/auth/register`        | Register new user      |
| POST   | `/auth/login`           | User login             |
| GET    | `/auth/verify/:token`   | Verify email address   |
| POST   | `/auth/forgot-password` | Request password reset |

### 🛍️ Products

| Method | Endpoint        | Description                  |
| ------ | --------------- | ---------------------------- |
| GET    | `/products`     | List products (with filters) |
| GET    | `/products/:id` | Get single product           |
| POST   | `/products`     | Create product _(Admin)_     |
| PUT    | `/products/:id` | Update product _(Admin)_     |
| DELETE | `/products/:id` | Delete product _(Admin)_     |

### 🛒 Orders

| Method | Endpoint             | Description                   |
| ------ | -------------------- | ----------------------------- |
| POST   | `/orders`            | Create new order              |
| GET    | `/orders`            | Get user's orders             |
| GET    | `/orders/:id`        | Get order details             |
| PUT    | `/orders/:id/status` | Update order status _(Admin)_ |

### 📬 Product Requests

| Method | Endpoint        | Description                 |
| ------ | --------------- | --------------------------- |
| POST   | `/requests`     | Request unavailable product |
| GET    | `/requests`     | View user's requests        |
| PUT    | `/requests/:id` | Update request _(Admin)_    |

## Error Handling

All errors return standard HTTP status codes with JSON response:

```json
{
  "message": "Human-readable error message",
  "error": "Optional detailed error info"
}
```
