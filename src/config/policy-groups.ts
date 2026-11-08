import type { PolicyGroup } from './policy-group';

// The order of the groups on /Legal and in the footer. Each id matches a `policies` collection `group` value.
export const policyGroups: ReadonlyArray<PolicyGroup> = [
    {
        id: 'legal',
        name: 'Legal',
        title: 'Who we are',
        highlight: 'and the terms we work to',
        lead: 'Our company details, how we handle personal data, and the terms for using this website.',
    },
    {
        id: 'responsibility',
        name: 'Responsibility',
        title: 'How we',
        highlight: 'do business',
        lead: 'The standards of conduct we hold ourselves to, and what anyone working with us can expect.',
    },
    {
        id: 'trust',
        name: 'Trust',
        title: 'Keeping your work',
        highlight: 'secure',
        lead: "How we protect the systems and information we're trusted with, and how to report a vulnerability.",
    },
];
