from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

# ===== CONFIGURACIÓN Y CONSTANTES =====
TOTAL_PREGUNTAS = 10  # Total de preguntas en el juego

# ===== CARGA DEL MODELO DE ML =====
# Cargar modelo y encoder
try:
    modelo = joblib.load("models/modelo_dificultad.pkl")
    encoder = joblib.load("models/encoder_dificultad_pregunta.pkl")
    print("==> Modelo y encoder cargados correctamente")
except FileNotFoundError:
    print("==> Error: No se encontro el archivo del modelo")
    modelo = None
    encoder = None

# ===== CONFIGURACIÓN DE FLASK =====
app = Flask(__name__)
# Configurar CORS para peticiones desde el frontend
CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])


# ===== ENDPOINTS DE LA API =====
@app.route("/predecir", methods=["POST"])
def predecir():
    """
    ENDPOINT PRINCIPAL: Predicción de dificultad adaptativa
    ====================================================
    Recibe datos sobre el rendimiento del jugador y devuelve la dificultad
    recomendada para la siguiente pregunta.
    """
    try:
        if modelo is None or encoder is None:
            return jsonify(
                {
                    "error": "Modelo o encoder no disponible",
                    "codigo": "MODEL_NOT_LOADED",
                }
            ), 500

        data = request.json
        print(f" ==> Datos recibidos: \n{data}")

        # Validar que se enviaron los datos requeridos
        campos_requeridos = [
            "edad",
            "nro_ronda",
            "vidas_usadas_ronda",
            "racha_aciertos",
            "dificultad_pregunta_anterior",
            "respuesta_correcta",
            "tiempo_respuesta",
        ]

        campos_faltantes = [campo for campo in campos_requeridos if campo not in data]
        if campos_faltantes:
            return jsonify(
                {
                    "error": f"Campos faltantes: {', '.join(campos_faltantes)}",
                    "codigo": "MISSING_FIELDS",
                    "campos_requeridos": campos_requeridos,
                }
            ), 400

        # Validar tipos de datos y rangos
        try:
            edad = int(data["edad"])
            nro_ronda = int(data["nro_ronda"])
            vidas_usadas_ronda = int(data["vidas_usadas_ronda"])
            racha_aciertos = int(data["racha_aciertos"])
            dificultad_pregunta_anterior = str(data["dificultad_pregunta_anterior"])
            respuesta_correcta = int(data["respuesta_correcta"])
            tiempo_respuesta = float(data["tiempo_respuesta"])

            # Validaciones de rango
            if edad < 0 or edad > 18:
                return jsonify(
                    {
                        "error": "La edad debe estar entre 3 y 18 años",
                        "codigo": "INVALID_AGE",
                    }
                ), 400
        except (ValueError, TypeError) as e:
            return jsonify(
                {
                    "error": f"Error en tipos de datos: {str(e)}",
                    "codigo": "INVALID_DATA_TYPES",
                }
            ), 400

        # Crear DataFrame con los datos de entrada
        entrada = pd.DataFrame(
            [
                {
                    "edad": edad,
                    "nro_ronda": nro_ronda,
                    "vidas_usadas_ronda": vidas_usadas_ronda,
                    "racha_aciertos": racha_aciertos,
                    "dificultad_pregunta_anterior": dificultad_pregunta_anterior,
                    "respuesta_correcta": respuesta_correcta,
                    "tiempo_respuesta": tiempo_respuesta,
                }
            ]
        )

        # Codificar variable categórica
        entrada["dificultad_pregunta_anterior"] = encoder.transform(
            entrada["dificultad_pregunta_anterior"]
        )

        # Realizar predicción
        pred_codificada = modelo.predict(entrada)[0]
        dificultad = encoder.inverse_transform([pred_codificada])[0]

        result = {"dificultad_siguiente_pregunta": dificultad}
        print(f"==> Dificultad predicha: \n{dificultad}")

        return jsonify(result)
    except Exception as e:
        print(f"==> Error inesperado en predicción: {str(e)}")
        return jsonify(
            {
                "error": f"Error interno del servidor: {str(e)}",
                "codigo": "INTERNAL_ERROR",
            }
        ), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Endpoint para verificar que la API funciona"""
    return jsonify(
        {
            "status": "OK",
            "modelo_disponible": modelo is not None,
            "encoder_disponible": encoder is not None,
            "mensaje": "Backend funcionando correctamente",
            "endpoints": {
                "GET /health": "Verificar estado de la API",
                "POST /predecir": "Predecir puntos del jugador",
            },
        }
    )


if __name__ == "__main__":
    print("🚀 Iniciando servidor Flask...")
    app.run(debug=True, host="0.0.0.0", port=5000)
