/**
 * MAPEO DE PROVINCIAS DE ECUADOR
 * =============================
 * 
 * Este archivo contiene el mapeo oficial de las 24 provincias de Ecuador
 * con sus números correspondientes para la integración con el hardware Arduino.
 * 
 * El mapeo sigue la numeración estándar utilizada en el mapa físico interactivo:
 * - Números del 0 al 23
 * - Cada provincia tiene un botón físico correspondiente
 * - La numeración no sigue un orden geográfico específico
 */

/**
 * Mapeo completo de provincias ecuatorianas
 * Cada provincia tiene asignado un número único del 0 al 23
 * 
 * @constant {Object} provinceMapping
 */
// Mapeo de provincias de Ecuador con sus números correspondientes
export const provinceMapping = {
  // REGIÓN SIERRA
  "Carchi": 0,                          // Frontera con Colombia
  "Imbabura": 3,                        // Otavalo, Lago San Pablo
  "Pichincha": 21,                      // Quito (Capital), Mitad del Mundo
  "Cotopaxi": 5,                        // Volcán Cotopaxi, Latacunga
  "Tungurahua": 11,                     // Baños, Ambato
  "Bolívar": 15,                        // Guaranda, Carnaval
  "Chimborazo": 9,                      // Riobamba, Volcán Chimborazo
  "Cañar": 13,                          // Ingapirca, Azogues
  "Azuay": 8,                           // Cuenca, Patrimonio UNESCO
  "Loja": 12,                           // Ciudad Musical, Podocarpus
  
  // REGIÓN COSTA
  "Esmeraldas": 20,                     // Cultura Afroecuatoriana, Marimba
  "Manabí": 23,                         // Manta, Playas de surf
  "Los Ríos": 17,                       // Babahoyo, Ventanas
  "Guayas": 16,                         // Guayaquil, Puerto principal
  "Santa Elena": 18,                    // Montañita, La Ruta del Sol
  "El Oro": 14,                         // Machala, Banano
  "Santo Domingo de los Tsáchilas": 19, // Pueblo Tsáchila, Bosques húmedos
  
  // REGIÓN AMAZONÍA
  "Sucumbíos": 1,                       // Coca, Cuyabeno
  "Orellana": 2,                        // Yasuní, Francisco de Orellana
  "Napo": 4,                            // Tena, Misahuallí
  "Pastaza": 6,                         // Puyo, Puerta al Oriente
  "Morona Santiago": 7,                 // Macas, Sangay
  "Zamora Chinchipe": 10,               // Zamora, Podocarpus
  
  // REGIÓN INSULAR
  "Galápagos": 22                       // Islas Galápagos, Darwin
};

/**
 * Obtiene el número asignado a una provincia específica
 * 
 * @function getProvinceNumber
 * @param {string} provinceName - Nombre exacto de la provincia
 * @returns {number|undefined} Número de la provincia (0-23) o undefined si no se encuentra
 * 
 * @example
 * getProvinceNumber("Pichincha") // Returns: 21
 * getProvinceNumber("Galápagos") // Returns: 22
 */
// Función para obtener el número de una provincia
export const getProvinceNumber = (provinceName) => {
  return provinceMapping[provinceName];
};

/**
 * Obtiene el nombre de una provincia por su número asignado
 * 
 * @function getProvinceName
 * @param {number} provinceNumber - Número de la provincia (0-23)
 * @returns {string|undefined} Nombre de la provincia o undefined si no se encuentra
 * 
 * @example
 * getProvinceName(21) // Returns: "Pichincha"
 * getProvinceName(22) // Returns: "Galápagos"
 */
// Función para obtener el nombre de una provincia por número
export const getProvinceName = (provinceNumber) => {
  return Object.keys(provinceMapping).find(key => provinceMapping[key] === provinceNumber);
};

/**
 * Selecciona preguntas aleatorias del banco total para una partida
 * 
 * Esta función es el corazón del sistema de aleatorización del juego:
 * 1. Toma una muestra aleatoria del banco de 48 preguntas
 * 2. Mapea cada pregunta con su información de provincia
 * 3. Asigna números de respuesta correcta para Arduino
 * 4. Genera logs detallados para debugging
 * 
 * @function selectRandomQuestions
 * @param {Array} questions - Banco completo de preguntas (48 preguntas)
 * @param {number} [count=10] - Número de preguntas a seleccionar
 * @returns {Array} Array de preguntas seleccionadas con datos enriquecidos
 * 
 * @example
 * const gameQuestions = selectRandomQuestions(allQuestions, 10);
 * // Returns: Array de 10 preguntas con estructura:
 * // {
 * //   id, province, question, hint,     // Datos originales
 * //   gameIndex: 0-9,                   // Posición en el juego
 * //   provinceNumber: 0-23,             // Número de provincia
 * //   correctAnswer: 0-23               // Respuesta esperada del Arduino
 * // }
 */
// Función para seleccionar preguntas aleatorias
export const selectRandomQuestions = (questions, count = 10) => {
  // Crear una copia del array para no modificar el original
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  
  // Seleccionar las primeras 'count' preguntas
  const selected = shuffled.slice(0, count);
  
  // Mapear las preguntas con la información de la provincia
  const mapped = selected.map((question, index) => ({
    ...question,
    gameIndex: index, // Índice en el juego (0-9)
    correctAnswer: getProvinceNumber(question.province) // Respuesta correcta para el Arduino
  }));

  return mapped;

  // Ejemplo de retorno:
  // [{  
  //   id: "1",  
  //  province: "Bolívar",
   // question: "¿Dónde celebran un carnaval muy colorido en Guaranda?",
  //  hint: "Esta provincia está en el centro de la sierra y su capital es Guaranda."
  //   gameIndex: 0,
  //   provinceNumber: 0,
  //   correctAnswer: 0,
  // }]
};


