import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDateString()
  @IsOptional()
  iepDue?: string;

  @IsDateString()
  @IsOptional()
  evalDue?: string;

  @IsString()
  @IsOptional()
  collaborators?: string;

  @IsString()
  @IsOptional()
  serviceTime?: string;

  @IsString()
  @IsOptional()
  school?: string;
}