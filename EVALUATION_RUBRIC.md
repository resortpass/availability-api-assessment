# Evaluation Rubric

Use this to understand how submissions are evaluated.

## Data Model Design (35 points)

### Schema Design (15 points)
- [ ] **Excellent (13-15)**: Clean separation of concerns, no 3rd party leakage, easily extensible for new product types, proper use of foreign keys and constraints
- [ ] **Good (10-12)**: Solid design with minor issues, could be more flexible, most constraints in place
- [ ] **Adequate (7-9)**: Works but has coupling issues or would be hard to extend, missing some constraints
- [ ] **Poor (0-6)**: Tightly coupled to 3rd party structure, or overly complex, or missing critical constraints

### Flexibility (10 points)
- [ ] **Excellent (9-10)**: Design easily handles new product types, sources, or availability models without schema changes
- [ ] **Good (7-8)**: Can handle extensions with minor schema changes
- [ ] **Adequate (5-6)**: Would require significant refactoring to add new product types
- [ ] **Poor (0-4)**: Hardcoded for only the two types given

### Documentation (10 points)
- [ ] **Excellent (9-10)**: DESIGN.md clearly explains all decisions, tradeoffs, and future considerations
- [ ] **Good (7-8)**: Good documentation, some tradeoffs explained
- [ ] **Adequate (5-6)**: Basic documentation, missing some key decisions
- [ ] **Poor (0-4)**: Little or no documentation of design choices

## API Design (25 points)

### Response Format (10 points)
- [ ] **Excellent (9-10)**: Intuitive, consistent format for both product types, client doesn't need to know the source
- [ ] **Good (7-8)**: Reasonable format with minor inconsistencies
- [ ] **Adequate (5-6)**: Works but awkward or inconsistent between product types
- [ ] **Poor (0-4)**: Confusing or exposes too many internal details

### Error Handling (8 points)
- [ ] **Excellent (7-8)**: Proper HTTP codes, graceful degradation, informative error messages
- [ ] **Good (5-6)**: Most errors handled well, some edge cases missed
- [ ] **Adequate (3-4)**: Basic error handling, crashes on some inputs
- [ ] **Poor (0-2)**: Poor or no error handling

### Performance Considerations (7 points)
- [ ] **Excellent (6-7)**: Efficient queries, considers N+1 problems, appropriate indexes documented
- [ ] **Good (4-5)**: Generally efficient, minor issues
- [ ] **Adequate (2-3)**: Works but some obvious performance issues
- [ ] **Poor (0-1)**: Inefficient queries or major performance problems

## Code Quality (25 points)

### Structure & Organization (10 points)
- [ ] **Excellent (9-10)**: Clear separation of concerns (routes/services/repositories), follows SOLID principles
- [ ] **Good (7-8)**: Well organized with minor coupling issues
- [ ] **Adequate (5-6)**: Somewhat organized but could be cleaner
- [ ] **Poor (0-4)**: Everything in one file or poor separation of concerns

### TypeScript Usage (8 points)
- [ ] **Excellent (7-8)**: Strong typing throughout, proper interfaces, no `any` types
- [ ] **Good (5-6)**: Good typing with minor gaps
- [ ] **Adequate (3-4)**: Basic typing, some `any` types
- [ ] **Poor (0-2)**: Minimal typing or mostly `any`

### Code Clarity (7 points)
- [ ] **Excellent (6-7)**: Self-documenting code, clear naming, easy to follow
- [ ] **Good (4-5)**: Generally clear with some confusing sections
- [ ] **Adequate (2-3)**: Somewhat hard to follow, poor naming
- [ ] **Poor (0-1)**: Difficult to understand

## Testing (15 points)

### Coverage (8 points)
- [ ] **Excellent (7-8)**: Tests for both product types, error cases, edge cases
- [ ] **Good (5-6)**: Good coverage with some gaps
- [ ] **Adequate (3-4)**: Basic happy path tests only
- [ ] **Poor (0-2)**: Minimal or no tests

### Test Quality (7 points)
- [ ] **Excellent (6-7)**: Clear test names, good assertions, tests are maintainable
- [ ] **Good (4-5)**: Solid tests with minor issues
- [ ] **Adequate (2-3)**: Tests work but are unclear or brittle
- [ ] **Poor (0-1)**: Poor test structure or unclear intent

## Bonus Points (up to 10 extra)

- [ ] **Caching strategy** for 3rd party API (+3)
- [ ] **Rate limiting** considerations (+2)
- [ ] **API documentation** (Swagger/OpenAPI) (+3)
- [ ] **Logging & observability** (+2)
- [ ] **Docker setup** for easy running (+2)
- [ ] **Exceptional code quality** that goes above and beyond (+3)

## Total Score

- **90-100+**: Exceptional - would hire immediately
- **80-89**: Strong - solid candidate
- **70-79**: Good - promising with some areas to improve
- **60-69**: Adequate - meets basic requirements
- **Below 60**: Needs improvement

## Red Flags (Automatic concerns)

- 3rd party API details leak into database schema
- No error handling for API failures
- No tests
- Code doesn't run
- Hardcoded values instead of configuration
- Security issues (SQL injection, etc.)

## Green Flags (Positive signals)

- Clean, extensible design that handles unknowns well
- Thoughtful documentation of tradeoffs
- Good test coverage including edge cases
- Considers production concerns (performance, monitoring, errors)
- Simple, elegant solutions over complex ones
- Evidence of iterative thinking ("I tried X, but Y was better because...")
