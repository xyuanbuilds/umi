import { encode } from 'gpt-3-encoder';
import { SYSTEM_PROMPT } from './constants';

test('prompt tokens less than 3800 ', () => {
  const encoded = encode(SYSTEM_PROMPT);

  console.log(encoded.length);

  expect(encoded.length).toBeLessThan(3800);
});
