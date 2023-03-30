import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';

export const KNOWLEDGE_DIR = `../../gpt-cache/knowledge`;

// function readJsonFile(path: string) {
//   try {
//     const string = readFileSync(path).toString();
//     return JSON.parse(string);
//   } catch {
//     return {};
//   }
// }

export function getKnowledgePath(docFileName: string, fileName: string) {
  const dirPath = join(__dirname, `${KNOWLEDGE_DIR}/${docFileName}`);

  if (!existsSync(dirPath)) {
    mkdirSync(dirPath);
  }
  return join(dirPath, `${fileName}.json`);
}

export function writeDocTree(docFileName: string, docTree: unknown) {
  writeFileSync(
    getKnowledgePath(docFileName, 'docTree'),
    JSON.stringify(docTree),
  );
}

export function writeKnowledge(docFileName: string, knowledge: string[]) {
  writeFileSync(
    getKnowledgePath(docFileName, 'knowledge'),
    JSON.stringify(knowledge),
  );
}

export function writeKnowledgeEmbeddings(
  docFileName: string,
  embeddings: number[][],
) {
  writeFileSync(
    getKnowledgePath(docFileName, 'knowledgeEmbeddings'),
    JSON.stringify(embeddings),
  );
}

// export function readKnowledge(docFileName: string) {
//   return readJsonFile(getKnowledgePath(docFileName, 'knowledge'));
// }

export function readAllKnowledge() {
  const dirs = readdirSync(join(__dirname, KNOWLEDGE_DIR));
  let knowledges: string[] = [];
  dirs.forEach((docDir) => {
    const docDirFiles = readdirSync(join(__dirname, KNOWLEDGE_DIR, docDir));
    docDirFiles.forEach((file) => {
      if (file === 'knowledge.json') {
        const curKnowkedge = readFileSync(
          join(__dirname, KNOWLEDGE_DIR, docDir, file),
          'utf-8',
        );
        knowledges = knowledges.concat(JSON.parse(curKnowkedge));
      }
    });
  });
  return knowledges;
}

export function readAllKnowledgeEmbeddings() {
  const dirs = readdirSync(join(__dirname, KNOWLEDGE_DIR));
  let knowledgeEmbeddings: number[][] = [];
  dirs.forEach((docDir) => {
    const docDirFiles = readdirSync(join(__dirname, KNOWLEDGE_DIR, docDir));
    docDirFiles.forEach((file) => {
      if (file === 'knowledgeEmbeddings.json') {
        const curEmbedding = readFileSync(
          join(__dirname, KNOWLEDGE_DIR, docDir, file),
          'utf-8',
        );
        knowledgeEmbeddings = knowledgeEmbeddings.concat(
          JSON.parse(curEmbedding),
        );
      }
    });
  });
  return knowledgeEmbeddings;
}
