export function getFrameworkId(): string { return 'bootstrap4'; }
export { default as Bootstrap4Renderer } from './Bootstrap4Renderer';
export { default } from './Bootstrap4Renderer';
// Ensure CSS is emitted by the build and available in dev
import './styles/touchspin-bootstrap4.scss';
