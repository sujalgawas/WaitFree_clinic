from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the WaitFree Clinic Backend!"})

if __name__ == "__main__":
    app.run(debug=True)
