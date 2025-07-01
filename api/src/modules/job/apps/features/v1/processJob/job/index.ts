import { logger } from '@/shared/utils/helpers/loggers';
import { bullMqRedisConnection, delay, JsonString, RunJobBullMq } from '@kishornaik/utils';
import { ProcessJobRequestDto } from '../contracts';

const jobQueueName: string = `demo-job-queue`;
const job = new RunJobBullMq(bullMqRedisConnection);

export const jobProcess = async () => {
  logger.info(`registered job: ${jobQueueName}`);

	const worker = await job.processAsync<JsonString>(jobQueueName, async (job) => {
		logger.info(`Job:id: ${job.id}`);

		logger.info(`Job:name: ${job.name}`);

		logger.info(`Job:correlationId: ${JSON.stringify(job.data.correlationId)}`);
		logger.info(`Job:data: ${JSON.stringify(job.data.data)}`);

		const request: ProcessJobRequestDto = JSON.parse(job.data.data as JsonString);
		logger.info(`request: ${JSON.stringify(request)}`);

    // Long running job
		await delay(10000);

		logger.info(`Job:processed: ${JSON.stringify(job.id)}`);
	});

  worker.on('completed', (job) => {
		console.log(`Job completed: ${job.id}`);
	});

	worker.on('failed', (job, err) => {
		console.error(
			`[Job failed: ${job.id}, Error: ${err.message}`
		);
	});
};
