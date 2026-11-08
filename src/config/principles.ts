import type { Principle } from './principle';

// What ONIXLabs stands for, shown under the home page hero. Each icon names a glass icon.
export const principles: ReadonlyArray<Principle> = [
    { title: 'Craftsmanship', icon: 'design', body: 'We treat code as a craft, writing software with precision, care, and pride in every detail.' },
    { title: 'Integrity', icon: 'shield', body: 'We uphold transparency, honesty, and reliability in every decision, from code to client collaboration.' },
    { title: 'Performance', icon: 'gauge', body: 'We engineer solutions that are not only functional but fast, efficient, and built to scale.' },
    { title: 'Enterprise', icon: 'buildings', body: 'Our platforms are designed for the complexity and demands of modern enterprises. Secure, scalable, and future-ready.' },
    { title: 'Community', icon: 'user-group', body: 'We thrive on collaboration, contributing to open-source and growing together with the global developer community.' },
    { title: 'Simplicity', icon: 'leaf', body: 'We believe the best solutions are intuitive, removing complexity to let clarity and function shine.' },
    { title: 'Education', icon: 'documents', body: 'We foster a culture of continuous learning, sharing knowledge, mentoring talent, and staying ahead of the curve.' },
    { title: 'Support', icon: 'support', body: 'We stand by our software and our users, delivering responsive, reliable support that builds long-term trust.' },
];
