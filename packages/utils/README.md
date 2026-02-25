# `@herk/utils` Rules

This package contains tiny, dependency-free utilities.

## Core Rules

1. **Utilities cannot use dependencies**
	- Do not add runtime dependencies to this package.
	- Keep each utility fully self-contained.

2. **Utilities cannot use other utility functions**
	- Do not import from other files in `packages/utils/src`.
	- Each utility must stand on its own with no internal chaining.

3. **Utilities must be organized by folder/category**
	- Group by concern under `src/`.
	- Keep naming clear and predictable.
	- Example categories:
	  - `src/string/`
	  - `src/array/`
	  - `src/number/`
	  - `src/object/`

4. **Exports must be declared explicitly in `package.json`**
	- Every public utility needs a direct subpath export.
	- Follow the same style as the current exports.

	Example (current pattern):

	```json
	{
	  "exports": {
		 "./string/isString": "./src/string/isString.ts",
		 "./array/isArray": "./src/array/isArray.ts"
	  }
	}
	```

5. **Never use barrel files**
	- Do **not** create `index.ts` files that re-export folders.
	- Always import from explicit subpaths.
	- ✅ `@herk/utils/string/isString`
	- ❌ `@herk/utils`

## New Utility Checklist

- Create the utility in the correct `src/<category>/` folder.
- Keep it dependency-free and standalone.
- Do not import from other utility files.
- Add an explicit subpath in `package.json` `exports`.
- Do not create barrel files.
