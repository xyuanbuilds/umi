import fs from 'fs';
import { marked } from 'marked';
import { join } from 'path';
import { countTokens } from '../utils/openai';
import { shortenContent } from '../utils/shorten';
import { buildKnowledgeEmbeddings } from './embedding';
import { writeDocTree, writeKnowledge } from './files';

const configDoc = join(__dirname, '../../../docs/docs/api/config.md');
const commandsDoc = join(__dirname, '../../../docs/docs/api/commands.md');

export const buildDocTreeAndKnowledge = () => {
  const configContent = fs.readFileSync(configDoc, 'utf-8');
  const commandsContent = fs.readFileSync(commandsDoc, 'utf-8');
  const configDocTree = getMdDocTree(configContent);
  const commandsDocTree = getMdDocTree(commandsContent);
  writeDocTree('config', configDocTree);
  writeDocTree('commands', commandsDocTree);

  writeKnowledge('config', getKnowledgeFromDocTree(configDocTree, 'config'));
  writeKnowledge(
    'commands',
    getKnowledgeFromDocTree(commandsDocTree, 'command'),
  );
};

export const initGptDoc = async () => {
  buildDocTreeAndKnowledge();
  await buildKnowledgeEmbeddings();
};

interface TreeNode {
  /** 标题文案: h1,h2... */
  text?: string;
  /** 文档块类型，基本是 heading */
  type: string;
  /** 文档块内容 (shortend) */
  content?: any;
  /** 当前文档块 tokens 计数 */
  tokensNum?: number;
  /** 标题等级 */
  depth: number;
  children: TreeNode[];
}

function last<T extends unknown>(arr: T[]) {
  return arr[arr.length - 1];
}

export function getMdDocTree(mdContent: string) {
  const tokens = marked.Lexer.lex(mdContent);
  const parentStack: TreeNode[] = [
    {
      type: 'root',
      depth: 0,
      children: [],
    },
  ];
  let content: any[] = [];
  for (let token of tokens) {
    if (token.type === 'heading') {
      if (last(parentStack)?.children?.length > 0) {
        const endNode = last(last(parentStack).children);
        endNode.content = transformContent(content);
        endNode.tokensNum = countTokens(endNode.content);
      } else {
        const endNode = last(parentStack);
        endNode.content = transformContent(content);
        endNode.tokensNum = countTokens(endNode.content);
      }
      content = [];

      const { type, text, depth } = token;
      const node: TreeNode = {
        type,
        text,
        depth,
        children: [],
      };

      if (node.depth > last(parentStack).depth) {
        last(parentStack).children.push(node);
        parentStack.push(node);
      } else {
        while (last(parentStack).depth >= node.depth) {
          parentStack.pop();
        }
        last(parentStack).children.push(node);
      }
    } else {
      content.push(token);
    }
  }

  if (last(parentStack)?.children?.length > 0) {
    const endNode = last(last(parentStack).children);
    endNode.content = transformContent(content);
    endNode.tokensNum = countTokens(endNode.content);
  } else {
    const endNode = last(parentStack);
    endNode.content = transformContent(content);
    endNode.tokensNum = countTokens(endNode.content);
  }

  return parentStack[0];
}

export function getKnowledgeFromDocTree(tree: TreeNode, tag: string) {
  const contents: string[] = [];
  const dfs = (node: TreeNode) => {
    if (node && node.type !== 'root') {
      // const { tokensNum } = node;
      // TODO can transform long doc paragraph to summary, may lose detail
      // if (tokensNum && tokensNum > 100) {
      // }
      contents.push(`${tag} ${node.text} | ${node.content}`);
    }
    node.children.forEach((i) => dfs(i));
    return;
  };
  dfs(tree);
  return contents;
}

function transformContent(content: marked.Token[]) {
  return content.reduce(
    (res, cur) =>
      `${res}${
        cur.type === 'paragraph'
          ? cur.tokens.reduce(
              (r, i) => `${r}${i.type === 'link' ? i.text : i.raw}`,
              '',
            )
          : shortenContent(cur.raw)
      }`,
    '',
  );
}
