import { IsString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateListingDto } from './create-listing.dto';
import { CreateTagDto } from './create-tag.dto';

export class CreateItemDto {
  @IsString()
  name: string;

  @IsBoolean()
  public: boolean;

  @ValidateNested()
  @Type(() => CreateListingDto)
  listing: CreateListingDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTagDto)
  tags: CreateTagDto[];
}
