import { PartialType } from '@nestjs/swagger';
import { CrearLibroDto } from './crear-libro.dto';

export class ActualizarLibroDto extends PartialType(CrearLibroDto) {}