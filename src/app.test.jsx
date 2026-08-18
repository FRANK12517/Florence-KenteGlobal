// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

beforeEach(async () => {
  document.body.innerHTML = '<div id="root"></div>';
  await import('./main.jsx');
});

describe('KenteGlobal commerce shell', () => {
  it('renders the storefront and core commerce navigation', async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(document.body.textContent).toContain('KenteGlobal');
    expect(document.body.textContent).toContain('The collection');
    expect(document.body.textContent).toContain('Custom Kente');
    expect(document.body.textContent).toContain('Account');
  });
});
