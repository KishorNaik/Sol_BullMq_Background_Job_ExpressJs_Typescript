import {
	IServiceHandlerAsync,
	IServiceHandlerVoidAsync,
	JsonString,
	Result,
	ResultError,
	ResultFactory,
	sealed,
	Service,
	StatusCodes,
	TriggerJobBullMq,
	TriggerJobMessageBullMq,
	tryCatchResultAsync,
	VOID_RESULT,
	VoidResult,
} from '@kishornaik/utils';
import { FeaturePostRequestDto } from '../../../contracts';
import { logger } from '@/shared/utils/helpers/loggers';
import { UUID } from 'crypto';

export interface ITriggerJobServiceParameters {
	request: FeaturePostRequestDto;
	job: {
		trigger: TriggerJobBullMq;
		name: string;
		id: UUID;
	};
}

export interface ITriggerJobService
	extends IServiceHandlerVoidAsync<ITriggerJobServiceParameters> {}

@sealed
@Service()
export class TriggerJobService implements ITriggerJobService {
	public handleAsync(
		params: ITriggerJobServiceParameters
	): Promise<Result<VoidResult, ResultError>> {
		return tryCatchResultAsync(async () => {
			// Guard
			if (!params) return ResultFactory.error(StatusCodes.BAD_REQUEST, 'params is null');

			if (!params.request)
				return ResultFactory.error(StatusCodes.BAD_REQUEST, 'params.request is null');

			if (!params.job)
				return ResultFactory.error(StatusCodes.BAD_REQUEST, 'params.job is null');

			const { trigger, name, id } = params.job;

			// Convert request into Json
			const jsonValue: JsonString = JSON.stringify(params.request) as JsonString;

			// Map with Job Message
			const message: TriggerJobMessageBullMq<JsonString> = {
				correlationId: id,
				data: jsonValue,
			};

			// Trigger Job
			await trigger.triggerAsync(name, { jobId: id }, message);

			return ResultFactory.success(VOID_RESULT);
		});
	}
}
