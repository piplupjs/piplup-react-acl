// Adds the jest-dom matchers (toBeInTheDocument, toBeEmptyDOMElement, …) to vitest's `expect`,
// and their types along with them. Lives outside src/ so the library build never sees it.
import '@testing-library/jest-dom/vitest';
