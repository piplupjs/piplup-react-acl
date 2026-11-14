import { combine, presets, rules } from '@piplup/code-infra/oxlint';

// The tests here are `*.spec.*` files run by Vitest, so they get the `test` preset's rules too.
const testPreset = {
  ...presets.test,
  overrides: presets.test.overrides?.map((override) => ({
    ...override,
    files: override.files.map((file) => file.replace('.test.', '.spec.')),
  })),
};

export default combine(presets.recommended, presets.spec, testPreset, {
  overrides: [
    {
      // Node.js command-line scripts.
      files: ['scripts/**'],
      rules: rules({ 'compat/compat': 'off', 'no-console': 'off' }),
    },
  ],
  // `<Can role="…">` is this library's own prop, not an ARIA role.
  rules: rules({ 'jsx-a11y/aria-role': ['error', { ignoreNonDOM: true }] }),
});
