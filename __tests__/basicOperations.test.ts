import touchspinHelpers from './helpers/touchspinHelpers';
import {page, port} from './helpers/jestPuppeteerServerSetup';

describe('Core functionality', () => {

  beforeEach(async () => {
    await touchspinHelpers.waitForTouchSpinReady(page, '#testinput_default');
  });

  it('should render TouchSpin buttons and handle basic increment/decrement', async () => {
    const selector = '#testinput_default';

    // Check buttons exist
    const upButton = await page.$('.bootstrap-touchspin-up');
    const downButton = await page.$('.bootstrap-touchspin-down');
    expect(upButton).toBeTruthy();
    expect(downButton).toBeTruthy();

    // Test increment
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');

    // Test decrement
    await touchspinHelpers.touchspinClickDown(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
  });

  it('should respect disabled and readonly states', async () => {
    const selector = '#testinput_default';

    // Test disabled input
    await touchspinHelpers.setInputAttr(page, selector, 'disabled', true);
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, selector)).toBe(true);

    // Reset and test readonly
    await touchspinHelpers.setInputAttr(page, selector, 'disabled', false);
    await touchspinHelpers.setInputAttr(page, selector, 'readonly', true);
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, selector)).toBe(true);
  });

  it('should initialize with correct disabled state for pre-disabled inputs', async () => {
    const disabledSelector = '#testinput_disabled';
    const readonlySelector = '#testinput_readonly';

    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, disabledSelector)).toBe(true);
    expect(await touchspinHelpers.checkTouchspinUpIsDisabled(page, readonlySelector)).toBe(true);
  });

  it('should handle custom step values correctly', async () => {
    const selector = '#testinput_individual_min_max_step_properties';

    // The initial value should be corrected to align with step=3
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');

    // Increment should increase by step amount (3)
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('54');

    // Additional increments
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('57');
  });

  it('should handle min/max boundaries', async () => {
    const selector = '#testinput_individual_min_max_step_properties';
    
    // Test reaching max value triggers event
    const initialMaxEvents = await touchspinHelpers.countEvent(page, selector, 'touchspin.on.max');
    
    // Multiple clicks should eventually hit the max
    for (let i = 0; i < 5; i++) {
      await touchspinHelpers.touchspinClickUp(page, selector);
    }
    
    const finalMaxEvents = await touchspinHelpers.countEvent(page, selector, 'touchspin.on.max');
    expect(finalMaxEvents).toBeGreaterThan(initialMaxEvents);
  });

  it('should support keyboard navigation', async () => {
    const selector = '#testinput_default';
    
    await page.focus(selector);
    await page.keyboard.press('ArrowUp');
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    
    await page.keyboard.press('ArrowDown');
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
  });

  it('should support mousewheel interaction', async () => {
    const selector = '#testinput_default';
    
    await page.focus(selector);
    
    // Scroll up (negative deltaY)
    await page.mouse.wheel({ deltaY: -100 });
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('51');
    
    // Scroll down (positive deltaY)
    await page.mouse.wheel({ deltaY: 100 });
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50');
  });

  it('should handle decimal values correctly', async () => {
    const selector = '#testinput_decimals';
    
    // Test decimal increment
    await touchspinHelpers.touchspinClickUp(page, selector);
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('50.01');
    
    // Test manual decimal input
    await touchspinHelpers.fillWithValue(page, selector, '12.34');
    await page.keyboard.press('Tab');
    expect(await touchspinHelpers.readInputValue(page, selector)).toBe('12.34');
  });
});