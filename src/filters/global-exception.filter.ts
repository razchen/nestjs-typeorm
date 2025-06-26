import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const responseContent = exception.getResponse();

      if (typeof responseContent === 'string') {
        message = responseContent;
      } else if (
        typeof responseContent === 'object' &&
        responseContent !== null
      ) {
        const res = responseContent as { message?: string };
        message = res.message ?? JSON.stringify(res);
      }
    } else if (exception instanceof EntityNotFoundError) {
      statusCode = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
    }

    response.json({
      statusCode,
      message,
    });
  }
}
