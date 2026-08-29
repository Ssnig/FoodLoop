# FoodLoop Design Language

Inspired by food-commerce patterns from [Instacart](https://mobbin.com/screens/0f8b24f4-4124-4aac-a839-929f714a7bee), [sweetgreen](https://mobbin.com/screens/ca3e705a-231b-4b21-a938-4b6184fffb22), and [HelloFresh](https://mobbin.com/screens/24b10f29-df0c-447e-aa28-84a1f60f3157) (via Mobbin).

## Feeling
Fresh grocery / meal-kit operator console — appetizing, calm, action-clear. Not a generic purple SaaS dashboard.

## Tokens
- **Canvas:** warm off-white cream with soft sage + citrus washes
- **Primary:** forest green (Instacart-like CTAs)
- **Accent:** ripe citrus amber for urgency / discount
- **Cards:** white, large radius, light green-tinted shadow
- **Type:** Fraunces (display / brand) + Nunito Sans (UI body)

## Patterns
- Pill navigation and pill buttons
- Food hero band on Dashboard
- Meal-kit style surplus cards with category visual strip
- Generous whitespace; one clear next action per page

## Stack
React + Vite + Tailwind + shadcn-style primitives. Pages stay thin; Backend stays in `Backend/src/services`.
