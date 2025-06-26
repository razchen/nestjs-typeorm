import { IsNotEmpty, IsString } from 'class-validator';

export class CreateListingDto {
  @IsNotEmpty()
  @IsString()
  description: string;
}
