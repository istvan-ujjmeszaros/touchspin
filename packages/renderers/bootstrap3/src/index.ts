export function getFrameworkId(): string { return 'bootstrap3'; }
export { default as Bootstrap3Renderer } from './Bootstrap3Renderer';
export { default } from './Bootstrap3Renderer';
// Ensure CSS is emitted by the build and available in dev
import './styles/touchspin-bootstrap3.scss';
