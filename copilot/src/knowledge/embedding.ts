import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import openai from '../utils/openai';
import { KNOWLEDGE_DIR, writeKnowledgeEmbeddings } from './files';

export const buildKnowledgeEmbeddings = async () => {
  const knowledgeDir = join(__dirname, KNOWLEDGE_DIR);
  const dirs = readdirSync(knowledgeDir);

  dirs.forEach((docDir) => {
    console.log(docDir);
    const docDirFiles = readdirSync(join(knowledgeDir, docDir));
    docDirFiles.forEach(async (file) => {
      if (file === 'knowledge.json') {
        const curKnowkedge = readFileSync(
          join(knowledgeDir, docDir, file),
          'utf-8',
        );

        const paragraphs = (JSON.parse(curKnowkedge) as string[]).reduce<
          Promise<null | number[]>[]
        >((arr, cur) => {
          arr.push(
            openai.getEmbedding(cur, `${docDir}_knowledge`) as Promise<
              number[]
            >,
          );
          arr.push(new Promise((r) => setTimeout(() => r(null), 3000)));
          return arr;
        }, []);
        const embeddings = await Promise.all(paragraphs);
        writeKnowledgeEmbeddings(
          docDir,
          embeddings.filter((i): i is number[] => i !== null),
        );
      }
    });
  });
};
