
import { useCallback, useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import './App.css'

interface Libro {
  id: number
  titulo: string
  autor: string
  isbn: string
  anio: number
  cantidad: number
}

interface FormularioLibro {
  titulo: string
  autor: string
  isbn: string
  anio: string
  cantidad: string
}

type Metodo = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface RegistroHTTP {
  id: number
  metodo: Metodo
  url: string
  solicitud: unknown
  estado: number | null
  respuesta: unknown
  duracion: number
}

const API_URL = 'http://localhost:3000/libros'

const formularioInicial: FormularioLibro = {
  titulo: '',
  autor: '',
  isbn: '',
  anio: '',
  cantidad: '1',
}

function interpretarError(datos: unknown, estado: number): string {
  if (typeof datos === 'object' && datos !== null && 'message' in datos) {
    const mensaje = datos.message
    if (Array.isArray(mensaje)) return mensaje.join(', ')
    if (typeof mensaje === 'string') return mensaje
  }

  return `Error HTTP ${estado}`
}

function explicarEstado(estado: number | null): string {
  switch (estado) {
    case 200:
      return 'OK: consulta o actualización realizada correctamente.'
    case 201:
      return 'Created: el servidor creó un nuevo recurso.'
    case 204:
      return 'No Content: operación exitosa sin cuerpo de respuesta.'
    case 400:
      return 'Bad Request: los datos no cumplen las validaciones.'
    case 404:
      return 'Not Found: el recurso solicitado no existe.'
    case 409:
      return 'Conflict: el ISBN ya está registrado.'
    case null:
      return 'Error de conexión: no se recibió respuesta HTTP del servidor.'
    default:
      return `El servidor respondió con el código ${estado}.`
  }
}

function App() {
  const [libros, setLibros] = useState<Libro[]>([])
  const [formulario, setFormulario] = useState<FormularioLibro>(formularioInicial)
  const [editando, setEditando] = useState<number | null>(null)
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [historial, setHistorial] = useState<RegistroHTTP[]>([])
  const [registroSeleccionado, setRegistroSeleccionado] = useState<number | null>(null)
  const [idConsulta, setIdConsulta] = useState('999')
  const [extraDesconocido, setExtraDesconocido] = useState(false)

  const solicitar = useCallback(async (
    metodo: Metodo,
    url: string,
    cuerpo?: unknown,
  ): Promise<unknown> => {
    const inicio = performance.now()
    let estado: number | null = null
    let datos: unknown = null

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: cuerpo === undefined
          ? undefined
          : { 'Content-Type': 'application/json' },
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      })

      estado = respuesta.status

      if (estado !== 204) {
        const texto = await respuesta.text()
        if (texto) {
          try {
            datos = JSON.parse(texto) as unknown
          } catch {
            datos = texto
          }
        }
      }

      if (!respuesta.ok) {
        throw new Error(interpretarError(datos, estado))
      }

      return datos
    } catch (fallo) {
      throw fallo
    } finally {
      const id = Date.now() + Math.random()
      const registro: RegistroHTTP = {
        id,
        metodo,
        url,
        solicitud: cuerpo ?? null,
        estado,
        respuesta: datos,
        duracion: Math.round(performance.now() - inicio),
      }
      setHistorial((anterior) => [registro, ...anterior].slice(0, 30))
      setRegistroSeleccionado(id)
    }
  }, [])

  const cargarLibros = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const datos = await solicitar('GET', API_URL)
      setLibros(datos as Libro[])
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'Error desconocido')
    } finally {
      setCargando(false)
    }
  }, [solicitar])

  useEffect(() => {
    void cargarLibros()
  }, [cargarLibros])

  function cambiarCampo(evento: ChangeEvent<HTMLInputElement>) {
    const { name, value } = evento.target
    setFormulario((anterior) => ({ ...anterior, [name]: value }))
  }

  function iniciarEdicion(libro: Libro) {
    setEditando(libro.id)
    setFormulario({
      titulo: libro.titulo,
      autor: libro.autor,
      isbn: libro.isbn,
      anio: String(libro.anio),
      cantidad: String(libro.cantidad),
    })
    setError('')
    setMensaje('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicion() {
    setEditando(null)
    setFormulario({ ...formularioInicial })
  }

  async function guardarLibro(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (procesando) return

    setProcesando(true)
    setError('')
    setMensaje('')

    const cuerpo: Record<string, unknown> = {
      titulo: formulario.titulo,
      autor: formulario.autor,
      isbn: formulario.isbn,
      anio: Number(formulario.anio),
      cantidad: Number(formulario.cantidad),
    }

    if (extraDesconocido) {
      cuerpo.propiedadDesconocida = 'Esta propiedad debe rechazarse'
    }

    try {
      const datos = await solicitar(
        editando === null ? 'POST' : 'PATCH',
        editando === null ? API_URL : `${API_URL}/${editando}`,
        cuerpo,
      )

      const libro = datos as Libro

      if (editando === null) {
        setLibros((anterior) => [...anterior, libro])
        setMensaje(`Libro "${libro.titulo}" registrado correctamente.`)
      } else {
        setLibros((anterior) =>
          anterior.map((actual) => actual.id === libro.id ? libro : actual),
        )
        setMensaje(`Libro "${libro.titulo}" actualizado correctamente.`)
      }

      setEditando(null)
      setFormulario({ ...formularioInicial })
      setExtraDesconocido(false)
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'Error desconocido')
    } finally {
      setProcesando(false)
    }
  }

  async function eliminarLibro(libro: Libro) {
    if (procesando || !window.confirm(`¿Eliminar "${libro.titulo}"?`)) return

    setProcesando(true)
    setError('')
    setMensaje('')

    try {
      await solicitar('DELETE', `${API_URL}/${libro.id}`)
      setLibros((anterior) => anterior.filter((actual) => actual.id !== libro.id))
      if (editando === libro.id) cancelarEdicion()
      setMensaje(`Libro "${libro.titulo}" eliminado correctamente.`)
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'Error desconocido')
    } finally {
      setProcesando(false)
    }
  }

  async function consultarId() {
    setProcesando(true)
    setError('')
    setMensaje('')

    try {
      const libro = await solicitar('GET', `${API_URL}/${idConsulta}`)
      setMensaje(`Libro encontrado: ${(libro as Libro).titulo}`)
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'Error desconocido')
    } finally {
      setProcesando(false)
    }
  }

  const seleccionado = historial.find(
    (registro) => registro.id === registroSeleccionado,
  ) ?? historial[0]

  const mostrarJSON = (valor: unknown) =>
    valor === null ? 'Sin contenido' : JSON.stringify(valor, null, 2)

  return (
    <div className="contenedor">
      <header>
        <h1>Sistema de Gestión de Biblioteca</h1>
        <p>Laboratorio interactivo de API HTTP con NestJS + React</p>
        <p>Desarrollado por Jorge Daniel Achij López</p>
        <a href="http://localhost:3000/api" target="_blank" rel="noreferrer">
          Abrir documentación Swagger
        </a>
      </header>

      <main>
        <h2>{editando === null ? 'Registrar nuevo libro' : `Editar libro #${editando}`}</h2>

        <form onSubmit={(evento) => void guardarLibro(evento)}>
          <div className="formulario-libro">
            <label>
              Título
              <input name="titulo" value={formulario.titulo}
                onChange={cambiarCampo} required minLength={2} maxLength={100} />
            </label>
            <label>
              Autor
              <input name="autor" value={formulario.autor}
                onChange={cambiarCampo} required minLength={2} maxLength={100} />
            </label>
            <label>
              ISBN
              <input name="isbn" value={formulario.isbn}
                onChange={cambiarCampo} required minLength={13} maxLength={13} />
            </label>
            <label>
              Año
              <input name="anio" type="number" value={formulario.anio}
                onChange={cambiarCampo} required min={1450} max={2100} step={1} />
            </label>
            <label>
              Cantidad
              <input name="cantidad" type="number" value={formulario.cantidad}
                onChange={cambiarCampo} required min={0} step={1} />
            </label>
          </div>

          <label className="opcion-validacion">
            <input type="checkbox" checked={extraDesconocido}
              onChange={(evento) => setExtraDesconocido(evento.target.checked)} />
            Enviar propiedad desconocida (demostrar error 400)
          </label>

          <div className="grupo-botones">
            <button disabled={procesando}>
              {procesando ? 'Procesando...' : editando === null ? 'POST — Registrar libro' : 'PATCH — Guardar cambios'}
            </button>
            {editando !== null && (
              <button type="button" onClick={cancelarEdicion} disabled={procesando}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>

        {error && <p role="alert">{error}</p>}
        {mensaje && <p role="status">{mensaje}</p>}

        <h2>Catálogo de libros</h2>
        <button type="button" onClick={() => void cargarLibros()} disabled={cargando || procesando}>
          GET — Actualizar catálogo
        </button>

        {cargando ? <p>Cargando libros...</p> : (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Título</th><th>Autor</th><th>ISBN</th>
                  <th>Año</th><th>Cantidad</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {libros.map((libro) => (
                  <tr key={libro.id}>
                    <td>{libro.id}</td>
                    <td>{libro.titulo}</td>
                    <td>{libro.autor}</td>
                    <td>{libro.isbn}</td>
                    <td>{libro.anio}</td>
                    <td>{libro.cantidad}</td>
                    <td>
                      <button type="button" onClick={() => iniciarEdicion(libro)}
                        disabled={procesando}>Editar</button>{' '}
                      <button type="button" onClick={() => void eliminarLibro(libro)}
                        disabled={procesando} style={{ background: '#b42318' }}>
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {libros.length === 0 && <p>No hay libros registrados todavía.</p>}
          </div>
        )}

        <section className="laboratorio-http">
          <h2>Laboratorio de errores HTTP</h2>
          <p>
            Consulta un ID inexistente para demostrar el código 404.
            Para demostrar 409, registra dos veces el mismo ISBN.
          </p>
          <div className="grupo-botones">
            <input aria-label="ID a consultar" value={idConsulta}
              onChange={(evento) => setIdConsulta(evento.target.value)}
              placeholder="ID del libro" />
            <button type="button" disabled={procesando}
              onClick={() => void consultarId()}>GET — Buscar ID</button>
          </div>
        </section>

        <section className="laboratorio-http">
          <h2>Monitor de solicitudes HTTP</h2>
          <p>
            Aquí se muestran las solicitudes reales enviadas por React,
            sus códigos HTTP y las respuestas de NestJS.
          </p>

          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Método</th><th>Ruta</th><th>Estado</th><th>Duración</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((registro) => (
                  <tr key={registro.id}>
                    <td><strong>{registro.metodo}</strong></td>
                    <td>{registro.url.replace('http://localhost:3000', '')}</td>
                    <td>{registro.estado ?? 'Sin respuesta'}</td>
                    <td>{registro.duracion} ms</td>
                    <td>
                      <button type="button"
                        onClick={() => setRegistroSeleccionado(registro.id)}>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {seleccionado && (
            <div className="detalle-http">
              <h3>{seleccionado.metodo} — {seleccionado.estado ?? 'Error de conexión'}</h3>
              <p>{explicarEstado(seleccionado.estado)}</p>
              <p><strong>URL:</strong> {seleccionado.url}</p>
              <h3>Solicitud enviada</h3>
              <pre>{mostrarJSON(seleccionado.solicitud)}</pre>
              <h3>Respuesta del servidor</h3>
              <pre>{mostrarJSON(seleccionado.respuesta)}</pre>
              <p>Tiempo de solicitud: {seleccionado.duracion} ms</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
