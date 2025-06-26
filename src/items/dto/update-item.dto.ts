import { IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { CreateCommentDto } from './create-comment.dto';
import { Type } from 'class-transformer';

export class UpdateItemDto {
  @IsBoolean()
  public: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCommentDto)
  comments: CreateCommentDto[];
}
