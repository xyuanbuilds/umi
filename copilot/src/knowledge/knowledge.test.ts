import fs from 'fs';
import { join } from 'path';
import { getKnowledgeFromDocTree, getMdDocTree } from './index';

const configDoc = join(__dirname, '../../../docs/docs/api/config.md');
const commandsDoc = join(__dirname, '../../../docs/docs/api/commands.md');

test('', async () => {
  const configContent = fs.readFileSync(configDoc, 'utf-8');
  const commandsContent = fs.readFileSync(commandsDoc, 'utf-8');

  const configDocTree = getMdDocTree(configContent);
  const commandsDocTree = getMdDocTree(commandsContent);

  const configKnowledges = getKnowledgeFromDocTree(configDocTree, 'config');
  const commandKnowledges = getKnowledgeFromDocTree(commandsDocTree, 'command');
  console.log();
});

test('knowledge has own embedding', async () => {});
