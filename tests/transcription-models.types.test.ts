import type {
  TranscriptionModel,
  TranscriptionModelKey,
} from '../src/index.js';

type Assert<T extends true> = T;

type _CanonicalAssemblyAiModelIsAdvertised = Assert<
  'assemblyai/universal-3-5-pro' extends TranscriptionModelKey ? true : false
>;
type _DeprecatedAssemblyAiAliasRemainsAdvertised = Assert<
  'assemblyai/universal-3-pro' extends TranscriptionModelKey ? true : false
>;

const canonicalModel: TranscriptionModel = 'assemblyai/universal-3-5-pro';
const deprecatedAlias: TranscriptionModel = 'assemblyai/universal-3-pro';
const legacySpelling: TranscriptionModel = 'assembly-ai-universal-3-pro';

void canonicalModel;
void deprecatedAlias;
void legacySpelling;
