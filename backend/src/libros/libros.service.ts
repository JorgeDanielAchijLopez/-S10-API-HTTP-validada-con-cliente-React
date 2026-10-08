import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { CrearLibroDto } from './dto/crear-libro.dto';
import { ActualizarLibroDto } from './dto/actualizar-libro.dto';

export interface Libro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  anio: number;
  cantidad: number;
}

@Injectable()
export class LibrosService {
  private libros: Libro[] = [];
  private siguienteId = 1;

  // Obtener todos los libros
  obtenerTodos(): Libro[] {
    return this.libros;
  }

  // Buscar un libro por ID
  obtenerUno(id: number): Libro {
    const libro = this.libros.find((libro) => libro.id === id);

    if (!libro) {
      throw new NotFoundException('Libro no encontrado');
    }

    return libro;
  }

  // Registrar un libro
  crear(datos: CrearLibroDto): Libro {
    const existe = this.libros.some(
      (libro) => libro.isbn === datos.isbn,
    );

    if (existe) {
      throw new ConflictException('Ya existe un libro con ese ISBN');
    }

    const nuevoLibro: Libro = {
      id: this.siguienteId++,
      ...datos,
    };

    this.libros.push(nuevoLibro);

    return nuevoLibro;
  }

  // Modificar un libro
  actualizar(id: number, datos: ActualizarLibroDto): Libro {
    const libro = this.obtenerUno(id);

    if (
      datos.isbn !== undefined &&
      this.libros.some(
        (otro) => otro.isbn === datos.isbn && otro.id !== id,
      )
    ) {
      throw new ConflictException('Ya existe un libro con ese ISBN');
    }

    Object.assign(libro, datos);

    return libro;
  }

  // Eliminar un libro
  eliminar(id: number): void {
    this.obtenerUno(id);

    this.libros = this.libros.filter((libro) => libro.id !== id);
  }
}