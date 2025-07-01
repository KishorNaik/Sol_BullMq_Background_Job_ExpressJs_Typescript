import { bullMqRunner } from '@/shared/utils/helpers/bullMq';
import { jobProcess } from './apps/features/v1/processJob/job';

export const jobModule: Function[] = [];
bullMqRunner.registerWorker(jobProcess);
