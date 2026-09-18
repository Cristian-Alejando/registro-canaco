'use server'

export async function validarSocio(numeroSocio: string) {
  try {
    const response = await fetch(process.env.IMPERA_API_URL as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.IMPERA_API_KEY as string,
      },
      body: JSON.stringify({ numsocio: numeroSocio }),
    });

    if (response.status === 200) {
      return { status: 'ok', existe: true, mensaje: 'Socio vigente' };
    } else if (response.status === 400 || response.status === 401) {
      return { status: 'error', existe: false, mensaje: 'Número no encontrado' };
    } else {
      return { status: 'error', existe: false, mensaje: 'Error al validar el número de socio' };
    }
  } catch (error) {
    console.error('Error al validar socio:', error);
    return { status: 'error', existe: false, mensaje: 'Error interno del servidor' };
  }
}
