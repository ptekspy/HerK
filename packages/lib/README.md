# `@herk/lib` Rules

This package contains reusable utility functions used across the monorepo.

## Core Rules

1. **Functions may use dependencies**
	- External dependencies are allowed when they provide clear value.
	- Keep dependencies minimal and focused.

2. **Functions may use other functions in `lib`**
	- Reuse existing utilities instead of duplicating logic.
	- Import directly from the concrete file path.

3. **Functions must be grouped into clear folders/categories**
	- Organize by domain or concern.
	- Keep related utilities together.
	- Example categories:
	  - `src/classNames/`
	  - `src/date/`
	  - `src/string/`
	  - `src/validation/`

4. **Exports must be declared in `package.json`**
	- Every public utility should be exported explicitly via the `exports` field.
	- Follow the same pattern as the current `classNames/cn` example.

	Example:

	```json
	{
	  "exports": {
		 "./classNames/cn": "./src/classNames/cn.ts",
		 "./date/formatDate": "./src/date/formatDate.ts"
	  }
	}
	```

5. **Never use barrel files**
	- Do **not** create `index.ts` files that re-export from a folder.
	- Consumers should import from explicit subpaths only.
	- ✅ `@herk/lib/classNames/cn`
	- ❌ `@herk/lib` (barrel-based re-export)

## Practical Checklist for New Lib Functions

- Put the lib utility in the correct category folder under `src/`.
- Import other internal utilities via direct file exports.
- Add an explicit `exports` entry in `package.json`.
- Avoid creating any folder-level or package-level barrel file.
