# Design Notes

Lightweight notes for the live session — bullet points are fine. Jot decisions down as you make them so we can discuss the tradeoffs afterwards.

## Assumptions

_Anything you decided to assume rather than ask about (timezones, stale data tolerance, etc.)._

## serviceId → product mapping

_How does `spa-001` relate to a `products` row? Where does that mapping live, and why?_

## API response format

_What shape did you choose for `GET /api/availability`, and how does it stay consistent across inventory and time-slotted products?_

## Error handling

_What happens when the 3rd-party API is down or returns something unexpected? What does the client see?_

## With more time

_What would you do next, or differently?_
