#! /home/benahmed/flask/venv/bin/python3
# -*- coding: UTF-8 -*-

from flask import Flask, render_template, request, redirect, url_for, jsonify

import json
import requests

app = Flask(__name__)


GISSMO_API_URL = 'https://gissmo.unistra.fr/api/v1/'


@app.route('/gissmo/')
def gissmo():
    response = requests.get(GISSMO_API_URL)
    content = json.loads(response.content.decode('utf-8'))

    if response.status_code != 200:
        #return jsonify({
        #    'status': 'error'
        #}), 500
        response.raise_for_status()

    data = []
    for prev in content['sites']:
        data.append(['sites', prev])

    return jsonify({
      'status': 'ok', 
      'data': data
    })

if __name__ == "__main__":
    app.run(debug=True)
