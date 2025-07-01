import { Response } from 'express';
import {
	Body,
	HttpCode,
	JsonController,
	OnUndefined,
	Post,
	Res,
	UseBefore,
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import {
	RequestData,
	sealed,
	StatusCodes,
	DataResponse as ApiDataResponse,
	requestHandler,
	RequestHandler,
	DataResponseFactory,
	PipelineWorkflowException,
	PipelineWorkflow,
	Container,
	defineParallelSteps,
	defineParallelStep,
	TriggerJobBullMq,
	bullMqRedisConnection,
} from '@kishornaik/utils';
import { mediator } from '@/shared/utils/helpers/medaitR';
import { logger } from '@/shared/utils/helpers/loggers';
import { ValidationMiddleware } from '@/middlewares/security/validations';
import { FeaturePostRequestDto, FeaturePostResponseDto } from '../contracts';
import { TriggerJobService } from './services/triggerJob';
import { randomUUID, UUID } from 'crypto';

const jobQueueName: string = `demo-job-queue`;
const bgJob = new TriggerJobBullMq(bullMqRedisConnection);
bgJob.setQueues(jobQueueName);

// #region Endpoint
@JsonController('/api/v1/demo')
@OpenAPI({ tags: [`demo`] })
export class FeaturePostEndpoint {
	@Post()
	@OpenAPI({
		summary: `background Job Demo`,
		tags: [`demo`],
		description: `background Job Demo`,
	})
	@HttpCode(StatusCodes.OK)
	@OnUndefined(StatusCodes.BAD_REQUEST)
	@UseBefore(ValidationMiddleware(FeaturePostRequestDto))
	public async postAsync(@Body() request: FeaturePostRequestDto, @Res() res: Response) {
		const response = await mediator.send(new FeaturePostCommand(request));
		return res.status(response.StatusCode).json(response);
	}
}
// endregion

// #region Command
@sealed
class FeaturePostCommand extends RequestData<ApiDataResponse<FeaturePostResponseDto>> {
	private readonly _request: FeaturePostRequestDto;

	public constructor(request: FeaturePostRequestDto) {
		super();
		this._request = request;
	}

	public get request(): FeaturePostRequestDto {
		return this._request;
	}
}
// #endregion

// pipeline enum
enum PipelineSteps {
	triggerJob = 'triggerJob',
	response = 'response',
}

// region Command Handler
@sealed
@requestHandler(FeaturePostCommand)
class FeaturePostCommandHandler
	implements RequestHandler<FeaturePostCommand, ApiDataResponse<FeaturePostResponseDto>>
{
	private pipeline = new PipelineWorkflow(logger);
	private readonly _triggerJobService: TriggerJobService;

	public constructor() {
		this._triggerJobService = Container.get(TriggerJobService);
	}

	public async handle(
		value: FeaturePostCommand
	): Promise<ApiDataResponse<FeaturePostResponseDto>> {
		try {
			// Guard
			if (!value) return DataResponseFactory.error(StatusCodes.BAD_REQUEST, 'value is null');

			if (!value.request)
				return DataResponseFactory.error(StatusCodes.BAD_REQUEST, 'value.request is null');

			const { request } = value;

			// Trigger Job
			await this.pipeline.step(PipelineSteps.triggerJob, async () => {
				const id: UUID = randomUUID();
				logger.info(`id: ${id}`);

				const result = await this._triggerJobService.handleAsync({
					request: request,
					job: {
						trigger: bgJob,
						name: `JOB:${jobQueueName}`,
						id: id,
					},
				});
				return result;
			});

			const response: FeaturePostResponseDto = new FeaturePostResponseDto();
			response.message = 'Trigger Job Successfully';

			// Response
			return await DataResponseFactory.success<FeaturePostResponseDto>(
				StatusCodes.OK,
				response
			);
		} catch (ex) {
			return await DataResponseFactory.pipelineError<FeaturePostResponseDto>(ex);
		}
	}
}
// endregion
