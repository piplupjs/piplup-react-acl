// The React half of the package. The build emits this entry as its own chunk with a `'use client'`
// directive, and `index` re-exports it from there. Keeping the directive on this chunk alone is what
// lets the plain check functions in `./lib` run in React Server Components: a `'use client'` file
// turns every one of its exports into a client reference, so it must never contain them.

export { Can, withCan, type CanProps, type WithCanOptions } from './can';
export {
  AccessControlProvider,
  useAccessControl,
  type AccessControlContextValue,
  type AccessControlProviderProps,
} from './context';
