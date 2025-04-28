/**
 * @jest-environment jsdom
 */

import { copyCodeToClipboard } from './script'; // you'll need to export your functions from script.js

// Mock navigator.clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn().mockResolvedValue(),
    },
});

// Basic Test
test('copies code to clipboard', async () => {
    // Create a fake element with a tooltip span inside
    document.body.innerHTML = `
    <div id="testElement">
      <span class="copy-tooltip" style="display: none;"></span>
    </div>
  `;

    const element = document.getElementById('testElement');

    await copyCodeToClipboard('sample code', element);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('sample code');
    const tooltip = element.querySelector('.copy-tooltip');
    expect(tooltip.style.display).toBe('block');
});
