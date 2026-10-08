import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { LibrosService } from './libros.service';
import { CrearLibroDto } from './dto/crear-libro.dto';
import { ActualizarLibroDto } from './dto/actualizar-libro.dto';

@ApiTags('Libros')
@Controller('libros')
export class LibrosController {
  constructor(private readonly librosService: LibrosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los libros' })
  @ApiResponse({ status: 200, description: 'Lista de libros' })
  obtenerTodos() {
    return this.librosService.obtenerTodos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar un libro por ID' })
  @ApiResponse({ status: 200, description: 'Libro encontrado' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.librosService.obtenerUno(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar un libro' })
  @ApiResponse({ status: 201, description: 'Libro registrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'ISBN duplicado' })
  crear(@Body() datos: CrearLibroDto) {
    return this.librosService.crear(datos);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar un libro' })
  @ApiResponse({ status: 200, description: 'Libro actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  @ApiResponse({ status: 409, description: 'ISBN duplicado' })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarLibroDto,
  ) {
    return this.librosService.actualizar(id, datos);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un libro' })
  @ApiResponse({ status: 204, description: 'Libro eliminado' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  eliminar(@Param('id', ParseIntPipe) id: number): void {
    this.librosService.eliminar(id);
  }
}