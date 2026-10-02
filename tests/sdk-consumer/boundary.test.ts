import { describe, it, expect } from 'vitest';
import { Heed, HeedError, RawActionRequestSchema } from '@heed-ai/runtime';

describe('SDK Boundary Test', () => {
  it('should export the public API types and classes', () => {
    expect(Heed).toBeDefined();
    expect(HeedError).toBeDefined();
    expect(RawActionRequestSchema).toBeDefined();
  });

  it('should construct a Heed instance successfully', () => {
    const heed = new Heed({ apiKey: 'test-key', baseUrl: 'http://localhost:3000' });
    expect(heed).toBeDefined();
  });
});
