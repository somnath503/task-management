import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  lead?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}