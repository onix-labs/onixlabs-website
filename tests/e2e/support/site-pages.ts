import type { SitePage } from './site-page';

// Every page the Blazor site served (except /Tools, which is moving to its own site), now kept under /archive while
// the new site is designed from a blank canvas at /.
export const sitePages: ReadonlyArray<SitePage> = [
    { path: '/archive', title: 'ONIXLabs | Enterprise Software Engineering for .NET, Kotlin & Corda' },
    { path: '/archive/Products', title: 'Products | ONIXLabs' },
    { path: '/archive/Products/Aero', title: 'Aero: The Modular .NET Suite for Enterprise Engineering | ONIXLabs' },
    { path: '/archive/Products/DotNet/Core', title: 'Core Library for .NET | ONIXLabs' },
    { path: '/archive/Products/DotNet/Numerics', title: 'Numerics Library for .NET | ONIXLabs' },
    { path: '/archive/Products/DotNet/Security', title: 'Security Library for .NET | ONIXLabs' },
    { path: '/archive/Products/Corda/Core', title: 'Corda Core Library | ONIXLabs' },
    { path: '/archive/Products/Corda/Identity-Framework', title: 'Corda Identity Framework | ONIXLabs' },
    { path: '/archive/Products/Corda/Business-Network-Management-System', title: 'Corda BNMS | ONIXLabs' },
    { path: '/archive/Products/Kotlin/Core', title: 'Kotlin Core Library | ONIXLabs' },
    { path: '/archive/Products/Kotlin/Projection', title: 'Kotlin Projection Library | ONIXLabs' },
    { path: '/archive/Products/Kotlin/Validation', title: 'Kotlin Validation Library | ONIXLabs' },
    { path: '/archive/Consulting', title: 'Software Engineering Consulting | ONIXLabs' },
    { path: '/archive/Contact', title: 'Contact | ONIXLabs' },
    { path: '/archive/Documentation', title: 'Documentation | ONIXLabs' },
    { path: '/archive/Documentation/Aero/Introduction-To-Aero', title: 'Introduction to Aero | ONIXLabs' },
    { path: '/archive/Documentation/CSharp/Syntactic-Sugar-Bitter-Aftertaste', title: 'Syntactic Sugar, Bitter Aftertaste | ONIXLabs' },
    { path: '/archive/Documentation/CSharp/Underscore-Overkill', title: 'Underscore, Overkill | ONIXLabs' },
    { path: '/archive/Documentation/Corda/Flow-Design-Guidelines-1', title: 'Flow Design Guidelines - Part 1 | ONIXLabs' },
    { path: '/archive/Documentation/Corda/Flow-Design-Guidelines-2', title: 'Flow Design Guidelines - Part 2 | ONIXLabs' },
    { path: '/archive/Documentation/Corda/Flow-Design-Guidelines-3', title: 'Flow Design Guidelines - Part 3 | ONIXLabs' },
    { path: '/archive/Documentation/Corda/Relational-Data-And-Pointers', title: 'Relational Data & Pointers | ONIXLabs' },
    { path: '/archive/Documentation/Number-Theory/The-Problem-With-Decimals', title: 'The Problem with Decimals | ONIXLabs' },
    { path: '/archive/Contributors/Matthew-Layton', title: 'Matthew Layton, Founder & Architect | ONIXLabs' },
    { path: '/archive/Contributors/Laura-Perez-Crespo', title: 'Laura Pérez Crespo, Software Engineer | ONIXLabs' },
    { path: '/archive/Contributors/Adam-Dry', title: 'Adam Dry, Integration Specialist | ONIXLabs' },
    { path: '/archive/Contributors/Ryan-Gledhill', title: 'Ryan Gledhill, Strategic Advisor | ONIXLabs' },
];
