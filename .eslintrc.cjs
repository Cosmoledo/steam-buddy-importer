module.exports = {
	env: {
		node: true,
		es2021: true
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended"
	],
	root: true,
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 12,
		sourceType: "module"
	},
	plugins: [
		"@typescript-eslint"
	],
	rules: {
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-inferrable-types": "off",
		"@typescript-eslint/no-namespace": "off",
		"@typescript-eslint/no-var-requires": "off",
		"@typescript-eslint/prefer-namespace-keyword": "off",
		"@typescript-eslint/type-annotation-spacing": "off",
		"block-scoped-var": "error",
		indent: ["error", "tab", {
			SwitchCase: 1
		}],
		"linebreak-style": ["error", "unix"],
		"no-alert": "off",
		"no-console": "off",
		"no-debugger": "off",
		"no-var": "error",
		quotes: ["error", "double"],
		semi: ["error", "always"],
		yoda: ["error", "never"]
	}
};
