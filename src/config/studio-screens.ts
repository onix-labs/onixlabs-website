import type { StudioScreen } from '../components/studio-screen';

// The screens the ONIXLabs Studio heroes show. Each id is its screenshot's file name, without the -l / -d theme suffix.
// The number of screens is mirrored in the heroes' CSS: change them together.
export const studioScreens: ReadonlyArray<StudioScreen> = [
    { id: '1-os-ws', label: 'Workspace', icon: 'squares-four', alt: 'A workspace with the solution explorer, a code editor, the error list, references and an agent' },
    { id: '2-os-vc', label: 'Source control', icon: 'git-branch', alt: 'Source control: the repository panel, a commit’s diff, the branch history graph and the commit details' },
    { id: '3-os-de', label: 'Databases', icon: 'database', alt: 'The database explorer with a SQL query result beside a graph query drawn as a network' },
    { id: '4-os-ae', label: 'API explorer', icon: 'network', alt: 'The API explorer with two requests side by side, their responses and the request history' },
    { id: '5-os-md', label: 'Markdown', icon: 'markdown-logo', alt: 'The Markdown editor showing a formatted README with its outline alongside' },
    { id: '6-os-ce', label: 'Code editor', icon: 'code', alt: 'The code editor showing a TypeScript file with an agent alongside' },
    { id: '7-os-te', label: 'Terminals', icon: 'terminal-window', alt: 'A terminal session running docker, dotnet and gh commands' },
    { id: '8-os-ai', label: 'Agents', icon: 'sparkle', alt: 'An agent tab answering questions about a project, with its reasoning shown' },
    { id: '9-os-dc', label: 'Containers', icon: 'shipping-container', alt: 'The container panel listing containers with their resource use, and a shell open in one of them' },
    { id: '10-os-be', label: 'Binary editor', icon: 'binary', alt: 'The binary editor showing a file byte by byte, with its disassembly and a data inspector' },
];
