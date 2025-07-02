"""
BACKEND DEL JUEGO INTERACTIVO DE ECUADOR
=====================================

API Flask para el sistema de puntuación inteligente con Machine Learning.
Recibe datos del frontend sobre el rendimiento del jugador y devuelve
puntuaciones calculadas por un modelo de ML entrenado.

Características:
- Predicción de puntos basada en múltiples factores
- Validación robusta de datos de entrada
- Normalización de puntuaciones
- Manejo de errores y fallbacks
- Endpoints de salud y testing

Autor: Sistema Educativo Ecuador
Versión: 2.0
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

# ===== CONFIGURACIÓN Y CONSTANTES =====

TOTAL_PREGUNTAS = 10  # Total de preguntas en el juego

def normalizar_puntaje(puntaje_ml):
    """
    Normaliza el puntaje dividiendo por el número total de preguntas.
    
    El modelo de ML puede devolver puntuaciones muy altas, por lo que
    se normalizan para mantener un rango razonable para el juego.
    
    Args:
        puntaje_ml (float): Puntaje bruto del modelo de ML
        
    Returns:
        int: Puntaje normalizado redondeado
    """
    puntaje_normalizado = puntaje_ml / TOTAL_PREGUNTAS
    return round(puntaje_normalizado)

# ===== CARGA DEL MODELO DE ML =====

# Cargar modelo entrenado
try:
    modelo = joblib.load("models/modelo_puntos.pkl")
    print("✅ Modelo cargado correctamente")
except FileNotFoundError:
    print("❌ Error: No se encontró el archivo del modelo")
    modelo = None

# ===== CONFIGURACIÓN DE FLASK =====

app = Flask(__name__)
# Configurar CORS para peticiones desde el frontend
CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

# ===== ENDPOINTS DE LA API =====

@app.route("/predecir", methods=["POST"])
def predecir():
    """
    ENDPOINT PRINCIPAL: Predicción de puntos con Machine Learning
    ==========================================================
    
    Recibe datos sobre el rendimiento del jugador y devuelve una puntuación
    calculada por el modelo de ML entrenado.
    
    Método: POST
    Content-Type: application/json
    
    Datos de entrada (JSON):
    {
        "tiempo_respuesta": float,      # Tiempo en segundos (requerido)
        "edad": int,                    # Edad del jugador 3-18 (requerido)  
        "vidas_usadas": int,            # Vidas usadas 0-3 (requerido)
        "es_correcto": int,             # 1=correcto, 0=incorrecto (requerido)
        "provincia_dificultad": int     # Dificultad 1-5 (opcional, default=3)
    }
    
    Respuesta exitosa (200):
    {
        "puntos_estimados": int,        # Puntos normalizados para el juego
        "puntos_raw": float,            # Puntos brutos del modelo (debug)
        "normalizado": bool             # Indica si se aplicó normalización
    }
    
    Errores posibles:
    - 400: Datos faltantes o inválidos
    - 500: Error del modelo o servidor
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
            "edad", 
            "vidas_usadas", 
            "es_correcto"
        ]
        
        # provincia_dificultad es opcional, se asignará valor por defecto si falta
        campos_opcionales = ["provincia_dificultad"]

        campos_faltantes = [campo for campo in campos_requeridos if campo not in data]
        if campos_faltantes:
            return jsonify({
                "error": f"Campos faltantes: {', '.join(campos_faltantes)}",
                "codigo": "MISSING_FIELDS",
                "campos_requeridos": campos_requeridos,
                "campos_opcionales": campos_opcionales
            }), 400
        
        # Validar tipos de datos y rangos
        try:
            tiempo_respuesta = float(data["tiempo_respuesta"])
            provincia_dificultad = int(data.get("provincia_dificultad", 3))  # Valor por defecto: 3 (medio)
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
        
        # Log si se usó valor por defecto para dificultad
        if "provincia_dificultad" not in data:
            print(f"ℹ️ Usando dificultad por defecto (3) - provincia_dificultad no enviada")
        
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

@app.route("/ejemplo", methods=["GET"])
def ejemplo_datos():
    """Endpoint que devuelve un ejemplo de datos para testing"""
    return jsonify({
        "ejemplo_peticion": {
            "tiempo_respuesta": 12.5,
            "provincia_dificultad": 3,  # Opcional: 1-5 (1=Fácil, 5=Difícil)
            "edad": 10,
            "vidas_usadas": 1,  # 0-3
            "es_correcto": 1    # 0 o 1
        },
        "campos_requeridos": [
            "tiempo_respuesta",
            "edad", 
            "vidas_usadas", 
            "es_correcto"
        ],
        "campos_opcionales": [
            "provincia_dificultad"  # Si no se envía, se usa valor 3 por defecto
        ],
        "respuesta_esperada": {
            "puntos_estimados": 15,
            "puntos_raw": 156.78,
            "normalizado": True
        }
    })

@app.route("/test", methods=["POST"])  
def test_prediction():
    """
    Endpoint de testing que prueba el modelo con datos de ejemplo
    
    Útil para verificar que el modelo funciona correctamente
    sin necesidad de enviar datos desde el frontend.
    """
    try:
        if modelo is None:
            return jsonify({
                "error": "Modelo no disponible para testing",
                "codigo": "MODEL_NOT_LOADED"
            }), 500
            
        # Datos de prueba
        test_data = {
            "tiempo_respuesta": 8.5,
            "provincia_dificultad": 3,
            "edad": 10,
            "vidas_usadas": 1,
            "es_correcto": 1
        }
        
        entrada = pd.DataFrame([test_data])
        puntos_raw = modelo.predict(entrada)[0]
        puntos_normalizados = normalizar_puntaje(puntos_raw)
        
        return jsonify({
            "test_result": "SUCCESS",
            "datos_enviados": test_data,
            "puntos_estimados": puntos_normalizados,
            "puntos_raw": round(puntos_raw, 2),
            "normalizado": True,
            "mensaje": "El modelo funciona correctamente"
        })
        
    except Exception as e:
        return jsonify({
            "test_result": "FAILED",
            "error": str(e),
            "mensaje": "Error al probar el modelo"
        }), 500

if __name__ == "__main__": 
    print("🚀 Iniciando servidor Flask...")
    app.run(debug=True, host='0.0.0.0', port=5000)
