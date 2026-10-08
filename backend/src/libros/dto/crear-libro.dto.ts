import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  Length,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CrearLibroDto {
  @ApiProperty({ example: 'Cien años de soledad' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  titulo: string;

  @ApiProperty({ example: 'Gabriel García Márquez' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  autor: string;

  @ApiProperty({ example: '9780307474728' })
  @IsString()
  @Length(13, 13)
  isbn: string;

  @ApiProperty({ example: 1967 })
  @IsInt()
  @Min(1450)
  @Max(2100)
  anio: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  cantidad: number;
}