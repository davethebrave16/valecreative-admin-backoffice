// Slug rules shared by every resource form and by the image file naming (see imageFileName.ts).
// Accents are stripped, apostrophes are removed without a separator ("dell'anello" → "dellanello"),
// every other run of non-alphanumeric characters becomes a single hyphen.
export const toSlug = (str: string): string =>
	str
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/['’‘`]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')

// Public URL slugs (artworks, series, techniques, categories): lowercase letters, digits, single hyphens.
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// `contents` slugs are lookup keys used by the site (e.g. `homepage_hero`, `bio`), so underscores are allowed.
export const CONTENT_SLUG_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/
