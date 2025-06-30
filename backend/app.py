from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

# Configuración
TOTAL_PREGUNTAS = 6  # Total de preguntas en el juego

def normalizar_puntaje(puntaje_ml):
    """
    Normaliza el puntaje dividiendo por el número total de preguntas.
    """
    puntaje_normalizado = puntaje_ml / TOTAL_PREGUNTAS
    return round(puntaje_normalizado)

# Cargar modelo entrenado
try:
    modelo = joblib.load("models/modelo_puntos.pkl")
    print("✅ Modelo cargado correctamente")
except FileNotFoundError:
    print("❌ Error: No se encontró el archivo del modelo")
    modelo = None

app = Flask(__name__)
# Configurar CORS para peticiones desde el frontend
CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

@app.route("/predecir", methods=["POST"])
def predecir():
    """
    Endpoint para predecir puntos basado en el rendimiento del jugador.
    
    Espera un JSON con las siguientes variables:
    - tiempo_respuesta: float (tiempo en segundos que tardó en responder)
    - provincia_dificultad: int (dificultad de la provincia del 1-5)
    - edad: int (edad del niño)
    - vidas_usadas: int (número de vidas que usó antes de acertar)
    - es_correcto: int (1 si acertó, 0 si falló)
    """
    try:
        if modelo is None:
            return jsonify({
                "error": "Modelo no disponible",
                "codigo": "MODEL_NOT_LOADED"
            }), 500
            
        data = request.json
        print(f"📩 Datos recibidos: {data}")
        
        # Validar que se enviaron los datos requeridos
        campos_requeridos = [
            "tiempo_respuesta", 
            "provincia_dificultad", 
            "edad", 
            "vidas_usadas", 
            "es_correcto"
        ]

        campos_faltantes = [campo for campo in campos_requeridos if campo not in data]
        if campos_faltantes:
            return jsonify({
                "error": f"Campos faltantes: {', '.join(campos_faltantes)}",
                "codigo": "MISSING_FIELDS",
                "campos_requeridos": campos_requeridos,
            }), 400
        
        # Validar tipos de datos y rangos
        try:
            tiempo_respuesta = float(data["tiempo_respuesta"])
            provincia_dificultad = int(data["provincia_dificultad"])
            edad = int(data["edad"])
            vidas_usadas = int(data["vidas_usadas"])
            es_correcto = int(data["es_correcto"])
            
            # Validaciones de rango
            if tiempo_respuesta < 0:
                return jsonify({"error": "tiempo_respuesta debe ser positivo"}), 400
            if provincia_dificultad < 1 or provincia_dificultad > 5:
                return jsonify({"error": "provincia_dificultad debe estar entre 1 y 5"}), 400
            if edad < 3 or edad > 18:
                return jsonify({"error": "edad debe estar entre 3 y 18 años"}), 400
            if vidas_usadas < 0 or vidas_usadas > 3:
                return jsonify({"error": "vidas_usadas debe estar entre 0 y 3"}), 400
            if es_correcto not in [0, 1]:
                return jsonify({"error": "es_correcto debe ser 0 o 1"}), 400
                
        except (ValueError, TypeError) as e:
            return jsonify({
                "error": f"Error en tipos de datos: {str(e)}",
                "codigo": "INVALID_DATA_TYPES"
            }), 400
        
        # Crear DataFrame con las columnas en el orden correcto que espera el modelo
        entrada_datos = {
            "tiempo_respuesta": tiempo_respuesta,
            "provincia_dificultad": provincia_dificultad,
            "edad": edad,
            "vidas_usadas": vidas_usadas,
            "es_correcto": es_correcto
        }
        
        entrada = pd.DataFrame([entrada_datos])
        print(f"🔄 Datos procesados para el modelo: {entrada_datos}")
        
        # Realizar predicción
        puntos_raw = modelo.predict(entrada)[0]
        
        # Normalizar el puntaje
        puntos_normalizados = normalizar_puntaje(puntos_raw)
        
        result = {
            "puntos_estimados": puntos_normalizados,
            "puntos_raw": round(puntos_raw, 2),  # Para debugging
            "normalizado": True
        }
        print(f"🤖 Predicción raw: {puntos_raw:.2f}, normalizada: {puntos_normalizados}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Error inesperado en predicción: {str(e)}")
        return jsonify({
            "error": f"Error interno del servidor: {str(e)}",
            "codigo": "INTERNAL_ERROR"
        }), 500

@app.route("/health", methods=["GET"])
def health_check():
    """Endpoint para verificar que la API funciona"""
    return jsonify({
        "status": "OK", 
        "modelo_disponible": modelo is not None,
        "mensaje": "Backend funcionando correctamente",
        "endpoints": {
            "GET /health": "Verificar estado de la API",
            "POST /predecir": "Predecir puntos del jugador",
            "GET /ejemplo": "Obtener ejemplo de datos para testing"
        }
    })

if __name__ == "__main__": 
    print("🚀 Iniciando servidor Flask...")
    app.run(debug=True, host='0.0.0.0', port=5000)
