import crypto from 'crypto';
import { encode } from 'gpt-3-encoder';
import { Configuration, OpenAIApi } from 'openai';
import cache from './cache';
// @ts-ignore
import { SocksProxyAgent } from '../../compiled/socks-proxy-agent';

const socksProxyUri = process.env.ALL_PROXY;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const withCache =
  (wrappedFn: (content: string) => Promise<unknown>, suffix: string) =>
  async (content: string, fileName?: string) => {
    const cacheName = `${fileName ?? ''}_${suffix}`;

    // content hash 作为缓存 key
    const hash = buildHash(content);
    const cacheValue = cache.get(cacheName, hash);

    if (cacheValue) {
      return cacheValue;
    }

    const res = await wrappedFn(content);
    cache.set(cacheName, hash, res);

    return res;
  };

/**
 * 向量化，用于匹配度计算
 * @param input
 * @returns
 */
export async function createEmbedding(content: string) {
  const response = await openai.createEmbedding(
    {
      model: 'text-embedding-ada-002',
      input: content,
    },
    {
      proxy: false,
      httpsAgent: socksProxyUri
        ? new SocksProxyAgent(socksProxyUri)
        : undefined,
    },
  );

  return response.data.data[0].embedding;
}

/**
 * 文本摘要化，减少 tokens 传输
 * @param content
 * @param tokenLength
 * @returns
 */
export async function getSummary(content: string) {
  const promptContext =
    // 字典翻译用于进一步减少 tokens 数目
    content.indexOf('|上文中a:') >= -1
      ? `'''{{content}}'''基于字典翻译并返回内容摘要：`
      : `'''{{content}}'''基于命名实体识别构建内容摘要：`;
  const contentTokenLength = countTokens(content);
  const promptContextTokenLength = countTokens(promptContext);

  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: promptContext.replace('{{content}}', content),
    // 1000 ~ 4096，最大也不能超过1000
    max_tokens: Math.min(
      4096 - contentTokenLength - promptContextTokenLength,
      1000,
    ),
    temperature: 0,
  });

  return strip(completion.data.choices[0].text, ['\n']);
}

// 去头尾指定字符
function strip(str: string | undefined, chars: string[]) {
  if (!str) return '';
  let newStr = str;
  chars.forEach((char) => {
    newStr = newStr.replace(new RegExp(`^${char}+|${char}+$`, 'g'), '');
  });
  return newStr;
}

function buildHash(content: string) {
  return crypto.createHash('md5').update(content).digest('hex');
}

export function countTokens(content: string) {
  return encode(content).length;
}

export default {
  countTokens,
  getSummary: withCache(getSummary, 'summary'),
  getEmbedding: withCache(createEmbedding, 'embedding'),
};
