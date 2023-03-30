const shortenContent = (content: string) => {
  // TODO dictionary
  return (
    content
      // 去无不需要文案
      .replaceAll('// ⛔', '')
      .replaceAll('// ✅', '')
      .replaceAll('💥', '')
      // 减少字符
      .replaceAll('——', '—')
      .replaceAll('\n\n', '\n')
      // 全角半角化
      .replaceAll('（', '(')
      .replaceAll('）', ')')
      .replaceAll('：', ':')
      .replaceAll('；', ';')
      .replaceAll('、', '|')
      .replaceAll('，', ',')
      .replaceAll('。', '.')
      .replaceAll('“', `'`)
      .replaceAll('”', `'`)
      // 去无意义空格
      .replaceAll('. ', '.')
      .replaceAll(` '`, `'`)
      .replaceAll('; ', ';')
  );
};

export { shortenContent };
