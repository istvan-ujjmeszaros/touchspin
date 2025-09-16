export function getFrameworkId(): string { return 'tailwind'; }
export { default as TailwindRenderer } from './TailwindRenderer';
export { default } from './TailwindRenderer';
// Ensure CSS is emitted by the build and available in dev
import './styles/touchspin-tailwind.scss';
