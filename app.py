from flask import Flask, request, jsonify, send_from_directory
import csv
import os
from flask_cors import CORS

app = Flask(__name__, static_url_path='', static_folder='.')
CORS(app)
USER_FILE = 'users.csv'

# Ensure the CSV file exists
def init_csv():
    if not os.path.exists(USER_FILE):
        with open(USER_FILE, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['username', 'password', 'country', 'role'])

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    country = data.get('country')
    role = data.get('role')

    # Check if user already exists
    with open(USER_FILE, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['username'] == username:
                return jsonify({"success": False, "message": "Username already exists."}), 409

    # Append new user
    with open(USER_FILE, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([username, password, country, role])

    return jsonify({"success": True, "message": "User registered successfully."})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    with open(USER_FILE, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['username'] == username and row['password'] == password:
                return jsonify({
                    "success": True,
                    "country": row['country'],
                    "role": row.get('role', 'manager')
                })

    return jsonify({"success": False, "message": "Invalid credentials."}), 401

@app.route('/')
def root():
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    init_csv()
    app.run(debug=True)