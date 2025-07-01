import { demoModule } from './demo/demo.Module';
import { jobModule } from './job/job.Module';

export const modulesFederation: Function[] = [...demoModule, ...jobModule];
