# Optimization Plan for Angular Project

## Information Gathered

- Angular 21 project with PrimeNG, over 100 files.
- Found console.log statements in multiple files (main.ts, sign-up.ts, admin components) - these should be removed for production.
- TODO comments indicating incomplete features (contact organizer functionality).
- Bundle budgets set in angular.json (700kB initial warning, 1.5MB error).
- Potential unused imports and dead code present.

## Plan

- [ ] Remove all console.log statements from TypeScript files to clean up production code.
- [ ] Address TODO comments: either implement missing functionality or remove if not needed.
- [ ] Check for unused imports across TypeScript files and remove them.
- [ ] Identify and remove any dead code or unused variables.
- [ ] Review SCSS files for unused styles and optimize.
- [ ] Ensure lazy loading is properly implemented for feature modules.

## Followup Steps

- [ ] Run `ng build --configuration=production` to check bundle size and ensure budgets are met.
- [ ] Test the application to ensure functionality is not broken after cleanup.
- [ ] Consider adding ESLint rules to prevent future console.logs in production.
