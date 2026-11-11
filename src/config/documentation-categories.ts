import type { DocumentationCategory } from './documentation-category';

// The order of the bands on /Documentation. Each id must match an `articles` collection `category` value. An article's
// category decides where it's listed, not its URL, which never changes.
export const documentationCategories: ReadonlyArray<DocumentationCategory> = [
    {
        id: 'products',
        name: 'Products',
        title: 'Every product',
        highlight: 'starts with a question',
        lead: 'Introductions to our products: the question each one answers, who it\'s for, and the thinking behind it.',
    },
    {
        id: 'dotnet',
        name: 'Foundations',
        title: 'The reasoning',
        highlight: 'behind the libraries',
        lead: 'The ideas the ONIXLabs .NET libraries are built on, and how to put them to work in your own code.',
    },
    {
        id: 'standards',
        name: 'Engineering Standards',
        title: 'Code is read',
        highlight: 'more than it\'s written',
        lead: 'The conventions we hold our own code to, and the reasons behind them, for the people and the agents who write it.',
    },
    {
        id: 'corda',
        name: 'Corda',
        title: 'Designing for',
        highlight: 'Corda 4',
        lead: 'Guidance on designing CorDapps for Corda 4, from the team that maintains the ONIXLabs Corda libraries.',
    },
];
