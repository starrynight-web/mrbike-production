# ADR 0001: Implementation of a Service Layer

## Status
Accepted

## Context
The MrBikeBD backend was originally built with business logic embedded directly within Django Rest Framework (DRF) ViewSets. This led to:
- Difficulties in maintaining complex workflows (e.g., listing approval + multi-channel notification).
- Duplication of logic between API views and background tasks.
- Brittle tests that required mocking the entire request/response cycle.

## Decision
We decided to extract all "business logic" and "side effects" into a dedicated Service Layer.
- **Location**: `apps/<app_name>/services.py`
- **Pattern**: Static methods or class methods in a Service class (e.g., `UsedBikeListingService`).
- **Responsibility**: Database transactions, external API calls, and notification triggers.

## Consequences
- **Positive**: Views are now thin and focused on HTTP concerns (validation, response formatting).
- **Positive**: Business logic is easily testable in isolation.
- **Positive**: Background tasks and management commands can reuse the same service methods.
- **Neutral**: Minor increase in file count and boilerplate.
