import type { DocumentationCategory } from './documentation-category';

// Sidebar order. Each id must match an `articles` collection `category` value.
export const documentationCategories: ReadonlyArray<DocumentationCategory> = [
    { id: 'aero', name: 'Aero' },
    { id: 'csharp', name: 'C#' },
    { id: 'corda', name: 'Corda' },
    { id: 'number-theory', name: 'Number Theory' },
];
