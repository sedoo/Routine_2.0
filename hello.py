#! /usr/bin/python
# -*- coding:utf-8 -*-

from flask import Flask
from flask import render_template


stations = ["toto", "tutu", "titi"]

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html", titre="TEST", stations=stations)

if __name__ == '__main__':
    app.run(debug=True)
