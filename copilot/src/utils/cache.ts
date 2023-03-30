import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const getCachePath = (fileName: string) =>
  join(__dirname, `../../gpt-cache/${fileName}.json`);

const getJson = (path: string): Record<string, unknown> => {
  if (!existsSync(path)) {
    return {};
  }
  let string = readFileSync(path).toString();
  let cacheJson = {};

  try {
    cacheJson = JSON.parse(string);
  } catch {}

  return cacheJson;
};

function get(fileName: string, key: string) {
  const json = getJson(getCachePath(fileName));
  return json[key];
}

/**
 * 保存缓存
 * @param fileName 缓存文件
 * @param key 内容 hash
 * @param value 缓存内容
 */
function set(fileName: string, key: string, value: unknown) {
  const cachePath = getCachePath(fileName);
  const json = getJson(cachePath);
  json[key] = value;
  writeFileSync(cachePath, JSON.stringify(json));
}

export default { set, get };
