export const commandTemplate = (knowledge: string) => `
umi 命令行及配置有以下内容：
${knowledge}
基于以上知识，根据我的要求，返回我应该使用的命令，只需返回这条命令，不返回任何其他信息。
`;
