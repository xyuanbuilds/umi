import ddot from '@stdlib/blas/base/ddot';
import openai from '../utils/openai';
import { readAllKnowledge, readAllKnowledgeEmbeddings } from './files';

let knowledgeEmbeddings = readAllKnowledgeEmbeddings();
let knowledgeList = readAllKnowledge();

const getMessageFromEmbedding = async (
  question: string,
): Promise<
  {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[]
> => {
  const questionEmbedding = (await openai.getEmbedding(
    question,
    'question',
  )) as number[];

  console.log(knowledgeEmbeddings.length);

  const knowledges = knowledgeEmbeddings
    .map((knowledgeEmbedding, index) => {
      const x = new Float64Array(questionEmbedding);
      const y = new Float64Array(knowledgeEmbedding);
      const ddotRes = ddot(x.length, x, 1, y, 1);
      return {
        index,
        ddot: ddotRes,
        knowledge: knowledgeList[index],
      };
    })
    .sort((a, b) => b.ddot - a.ddot)
    .filter((k) => k.ddot > 0.78)
    .reduce((r, i) => `${r} | ${i.knowledge}`, '');

  console.log('knowledges', knowledges);

  if (knowledges.length === 0) {
    throw new Error('sss');
  }

  return [
    {
      role: 'system',
      content: question,
    },
    {
      role: 'user',
      content: knowledges,
    },
  ];
};

export { getMessageFromEmbedding };
